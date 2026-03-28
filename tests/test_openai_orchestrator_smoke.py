"""
Smoke test: OpenAI Agents orchestrator persistence with mocked LLM services (no API keys).
"""

import asyncio
import json
import os
import sys
from unittest.mock import AsyncMock, patch

import pytest

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OPENAI_AGENTIC = os.path.join(PROJECT_ROOT, 'openai-agentic')
LLMS_DIR = os.path.join(PROJECT_ROOT, 'LLMs')


def _drop_llms_utils_modules() -> None:
    """If `utils` was loaded from LLMs/, remove it so openai-agentic/utils can load."""
    u = sys.modules.get('utils')
    if u is None:
        return
    uf = getattr(u, '__file__', '') or ''
    paths = list(getattr(u, '__path__', []) or [])
    if 'LLMs' not in uf and not any('LLMs' in str(p) for p in paths):
        return
    for key in list(sys.modules):
        if key == 'utils' or key.startswith('utils.'):
            del sys.modules[key]


@pytest.fixture
def openai_agentic_importable():
    """
    Ensure `utils` resolves to openai-agentic/utils (conftest also adds LLMs/, which shadows `utils`).
    """
    if LLMS_DIR in sys.path:
        sys.path.remove(LLMS_DIR)
    sys.path.insert(0, OPENAI_AGENTIC)
    if PROJECT_ROOT not in sys.path:
        sys.path.insert(0, PROJECT_ROOT)
    _drop_llms_utils_modules()

    yield

    if OPENAI_AGENTIC in sys.path:
        sys.path.remove(OPENAI_AGENTIC)
    if LLMS_DIR not in sys.path:
        sys.path.insert(0, LLMS_DIR)


def test_orchestrator_round_trip_with_mocked_services(
    app, db, sample_round, openai_agentic_importable, monkeypatch
):
    """One email: mocked generator + detector; data persisted on Round sample_round."""

    import utils.db_utils as db_utils_mod

    # Use the pytest app's DB binding; do not push another app context (avoids stack mismatch with conftest).
    monkeypatch.setattr(db_utils_mod, '_app', app, raising=False)

    import main as oa_main

    gen_payload = {
        'subject': 'Urgent',
        'from': 'sender@example.com',
        'body': 'Please verify your account.',
        'is_phishing': True,
        'metadata': {'test': True},
    }
    det_payload = {
        'verdict': 'PHISHING',
        'confidence': 0.92,
        'scam_score': 0.85,
        'reasoning': 'Mocked detector reasoning.',
    }

    gen_svc = AsyncMock()
    gen_svc.generate_email = AsyncMock(
        return_value=type('GenResult', (), {'final_output': json.dumps(gen_payload)})()
    )
    det_svc = AsyncMock()
    det_svc.analyze_email = AsyncMock(
        return_value=type('DetResult', (), {'final_output': json.dumps(det_payload)})()
    )

    async def _run():
        with patch.object(oa_main, 'GeneratorAgentService', return_value=gen_svc):
            with patch.object(oa_main, 'DetectorAgentService', return_value=det_svc):
                orch = oa_main.Orchestrator(
                    round_id=sample_round.id,
                    num_parallel_workflows=1,
                )
                return await orch.run_parallel_workflows(total_emails=1)

    result = asyncio.run(_run())

    assert result['total_succeeded'] == 1
    assert result['total_processed'] >= 1

    from app.models import Email

    rows = Email.query.filter_by(round_id=sample_round.id).all()
    assert len(rows) == 1
    assert rows[0].is_phishing is True
    assert rows[0].detector_verdict == 'phishing'
