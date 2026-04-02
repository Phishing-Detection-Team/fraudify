"""
Model setup — quantization config, model loading, tokenizer, and LoRA application.

Exports:
    build_quant_config()  -> BitsAndBytesConfig | None
    load_tokenizer()      -> AutoTokenizer
    load_model()          -> AutoModelForCausalLM
    apply_lora()          -> PeftModel
"""

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import LoraConfig, TaskType, get_peft_model, prepare_model_for_kbit_training

import config


# ─── Quantization ─────────────────────────────────────────────────────────────

def build_quant_config() -> BitsAndBytesConfig | None:
    """
    Build a BitsAndBytesConfig based on config flags.

    Returns None if both QUANT_4_BIT and QUANT_8_BIT are False
    (i.e. full precision / bfloat16 training).
    """
    if config.QUANT_4_BIT:
        print("Quantization: 4-bit NF4 (QLoRA)")
        return BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_compute_dtype=torch.bfloat16,
            bnb_4bit_quant_type="nf4",
        )
    if config.QUANT_8_BIT:
        print("Quantization: 8-bit")
        return BitsAndBytesConfig(
            load_in_8bit=True,
            bnb_8bit_compute_dtype=torch.bfloat16,
        )
    print("Quantization: none (full precision)")
    return None


# ─── Tokenizer ────────────────────────────────────────────────────────────────

def load_tokenizer() -> AutoTokenizer:
    """
    Load the Qwen2.5-Instruct tokenizer.

    Sets pad_token to eos_token and padding_side to "right" — both required
    for causal LM SFT training to avoid gradient issues on padded tokens.

    Returns:
        AutoTokenizer with chat_template ready for apply_chat_template().
    """
    print(f"\nLoading tokenizer: {config.BASE_MODEL}")
    tokenizer = AutoTokenizer.from_pretrained(
        config.BASE_MODEL,
        trust_remote_code=True,
    )
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"
    print(f"  Chat template present: {tokenizer.chat_template is not None}")
    print(f"  Vocab size: {tokenizer.vocab_size:,}")
    return tokenizer


# ─── Model loading ────────────────────────────────────────────────────────────

def load_model(
    quant_config: BitsAndBytesConfig | None,
) -> AutoModelForCausalLM:
    """
    Load Qwen2.5-1.5B-Instruct as a causal language model.

    Args:
        quant_config: BitsAndBytesConfig or None for full bfloat16 precision.

    Returns:
        AutoModelForCausalLM ready for LoRA wrapping.
    """
    print("\n" + "=" * 60)
    print("LOADING MODEL")
    print("=" * 60)
    print(f"Base model: {config.BASE_MODEL}")

    kwargs: dict = dict(
        trust_remote_code=True,
        device_map="auto",
    )

    if quant_config is not None:
        kwargs["quantization_config"] = quant_config
    else:
        kwargs["torch_dtype"] = torch.bfloat16

    model = AutoModelForCausalLM.from_pretrained(
        config.BASE_MODEL,
        **kwargs,
    )

    footprint_gb = model.get_memory_footprint() / 1e9
    print(f"Memory footprint: {footprint_gb:.2f} GB")

    return model


# ─── LoRA ─────────────────────────────────────────────────────────────────────

def apply_lora(model: AutoModelForCausalLM):
    """
    Wrap the base model with LoRA adapters for causal language modeling.

    LoRA injects trainable low-rank matrices into the target projection
    layers. All other weights are frozen.

    Args:
        model: The loaded base model.

    Returns:
        PeftModel with LoRA adapters applied and frozen base weights.
    """
    print("\n" + "=" * 60)
    print("APPLYING LoRA")
    print("=" * 60)

    # Cast non-quantized layers to float32 so they can accept gradients
    # when using 4-bit / 8-bit quantization.
    if config.QUANT_4_BIT or config.QUANT_8_BIT:
        model = prepare_model_for_kbit_training(model)

    lora_config = LoraConfig(
        task_type=TaskType.CAUSAL_LM,
        r=config.LORA_R,
        lora_alpha=config.LORA_ALPHA,
        lora_dropout=config.LORA_DROPOUT,
        target_modules=config.TARGET_MODULES,
        bias="none",
    )

    peft_model = get_peft_model(model, lora_config)

    # Print trainable vs total param breakdown
    trainable, total = 0, 0
    for _, p in peft_model.named_parameters():
        total += p.numel()
        if p.requires_grad:
            trainable += p.numel()

    print(f"LoRA rank (r):       {config.LORA_R}")
    print(f"LoRA alpha:          {config.LORA_ALPHA}")
    print(f"LoRA dropout:        {config.LORA_DROPOUT}")
    print(f"Target modules:      {config.TARGET_MODULES}")
    print(f"\nTrainable params:    {trainable:,}  ({trainable / total:.2%} of total)")
    print(f"Total params:        {total:,}")

    return peft_model
