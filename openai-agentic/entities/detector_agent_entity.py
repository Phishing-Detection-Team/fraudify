import logging
import os
from dotenv import load_dotenv
from entities.base_entity import BaseEntity
from utils.prompts import get_system_prompt_detector

load_dotenv()

logger = logging.getLogger(__name__)

# Module-level singleton: loaded once on first use.
_MODEL_CACHE: dict = {}

OLLAMA_MODEL    = os.getenv("OLLAMA_MODEL", "hf.co/duyle240820/sentra-utoledo-v2.0")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")


class _OllamaClient:
    """
    Minimal wrapper around Ollama's OpenAI-compatible endpoint.
    """

    def __init__(self, model: str, base_url: str):
        self.model = model
        self.base_url = base_url.rstrip("/")

    def create_chat_completion(self, messages, max_tokens=128, temperature=0.0, **_):
        import requests
        resp = requests.post(
            f"{self.base_url}/v1/chat/completions",
            json={
                "model": self.model,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "stream": False,
                "format": "json",   # Ollama-native JSON mode (forces valid JSON output)
                # Cap KV cache to 1024 tokens — enough for a 2000-char email + system prompt
                # + 80-token output. Halving from 2048 cuts CPU KV-cache work ~2x.
                "options": {"num_ctx": 1024},
            },
            timeout=300,
        )
        resp.raise_for_status()
        return resp.json()


def _load_ollama(_model_id: str):
    """
    Use Ollama as inference backend.

    Steps (all automatic on first use):
      1. Verify Ollama is running (clear error if not).
      2. Check whether the model is already pulled.
      3. Pull it if missing (~0.9 GB, one-time per machine).
      4. Return an _OllamaClient.

    Teammates only need to install Ollama (https://ollama.com/download).
    The pull happens automatically on their first scan.
    """
    import requests

    # 1 — verify Ollama server is reachable
    try:
        requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=3)
    except Exception:
        raise RuntimeError(
            "Ollama server is not running. "
            "Start it with:  ollama serve  (or launch the Ollama desktop app)."
        )

    # 2 — check whether the model is already pulled via /api/show
    try:
        show_name = OLLAMA_MODEL if ":" in OLLAMA_MODEL else f"{OLLAMA_MODEL}:latest"
        show_resp = requests.post(
            f"{OLLAMA_BASE_URL}/api/show",
            json={"name": show_name},
            timeout=5,
        )
        model_pulled = show_resp.status_code == 200
        logger.info(
            "[Sentra] Ollama /api/show '%s' → HTTP %d (model_pulled=%s)",
            show_name, show_resp.status_code, model_pulled,
        )
    except Exception as e:
        logger.warning("[Sentra] Ollama /api/show check failed: %s", e)
        model_pulled = False

    # 3 — auto-pull if missing
    if not model_pulled:
        logger.info(
            "[Sentra] Pulling '%s' via Ollama REST API (~0.9 GB, first-time only)...", OLLAMA_MODEL
        )
        pull_resp = requests.post(
            f"{OLLAMA_BASE_URL}/api/pull",
            json={"name": OLLAMA_MODEL},
            stream=True,
            timeout=1800,  # 30 min — large model on slow connection
        )
        pull_resp.raise_for_status()
        for _ in pull_resp.iter_lines():
            pass  # consume streamed progress events until pull completes
        logger.info("[Sentra] Ollama pull complete.")
    else:
        logger.info("[Sentra] Ollama model already present: %s", OLLAMA_MODEL)

    return _OllamaClient(OLLAMA_MODEL, OLLAMA_BASE_URL), None


def get_cached_model(model_id: str):
    """Return the cached _OllamaClient, loading it on first call."""
    if "ollama" not in _MODEL_CACHE:
        logger.info("[Sentra] Loading model via Ollama...")
        _MODEL_CACHE["ollama"] = _load_ollama(model_id)
        logger.info("[Sentra] Model loaded via Ollama.")
    return _MODEL_CACHE["ollama"]


class DetectorAgentEntity(BaseEntity):
    """Entity for Detector Agent — manages model state and configuration."""

    MODEL_ID = "duyle240820/sentra-utoledo-v2.0"

    def __init__(self):
        super().__init__()
        self.model, self.tokenizer = get_cached_model(self.MODEL_ID)
        self.system_prompt = get_system_prompt_detector()
