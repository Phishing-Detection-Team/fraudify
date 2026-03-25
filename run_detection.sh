#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

METHOD=""
ROUNDS=""
EMAILS=""
WORKFLOWS="2"

usage() {
  cat <<'EOF'
Phishing Detection System - Consolidation Script
=================================================

Unified CLI interface to run either OpenAI Agents SDK or Semantic Kernels implementation.

Usage:
  ./run_detection.sh --method openai --rounds 3 --emails 10 --workflows 2
  ./run_detection.sh --method semantic-kernels --rounds 3 --emails 10

Arguments:
  --method       Required. One of: openai, semantic-kernels, semantic kernels
  --rounds       Required. Number of rounds
  --emails       Required. Emails per round
  --workflows    Optional. Parallel workflows for OpenAI (default: 2)
  -h, --help     Show this help message
EOF
}

is_positive_int() {
  [[ "$1" =~ ^[1-9][0-9]*$ ]]
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --method)
      METHOD="${2:-}"
      shift 2
      ;;
    --rounds)
      ROUNDS="${2:-}"
      shift 2
      ;;
    --emails)
      EMAILS="${2:-}"
      shift 2
      ;;
    --workflows)
      WORKFLOWS="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$METHOD" || -z "$ROUNDS" || -z "$EMAILS" ]]; then
  echo "Missing required arguments." >&2
  usage
  exit 1
fi

if ! is_positive_int "$ROUNDS"; then
  echo "--rounds must be a positive integer." >&2
  exit 1
fi

if ! is_positive_int "$EMAILS"; then
  echo "--emails must be a positive integer." >&2
  exit 1
fi

if ! is_positive_int "$WORKFLOWS"; then
  echo "--workflows must be a positive integer." >&2
  exit 1
fi

case "$METHOD" in
  openai)
    METHOD_NORMALIZED="openai"
    ;;
  semantic-kernels|"semantic kernels")
    METHOD_NORMALIZED="semantic-kernels"
    ;;
  *)
    echo "--method must be one of: openai, semantic-kernels, semantic kernels" >&2
    exit 1
    ;;
esac

printf '%0.s=' {1..70}
echo
echo "PHISHING DETECTION SYSTEM"
printf '%0.s=' {1..70}
echo

if [[ "$METHOD_NORMALIZED" == "openai" ]]; then
  echo "Method: OPENAI | Rounds: $ROUNDS | Emails per Round: $EMAILS | Workflows: $WORKFLOWS"
else
  echo "Method: SEMANTIC-KERNELS | Rounds: $ROUNDS | Emails per Round: $EMAILS"
fi

printf '%0.s=' {1..70}
echo

if [[ "$METHOD_NORMALIZED" == "openai" ]]; then
  python3 - "$SCRIPT_DIR" "$ROUNDS" "$EMAILS" "$WORKFLOWS" <<'PY'
import asyncio
import os
import sys

project_root = sys.argv[1]
rounds = int(sys.argv[2])
emails = int(sys.argv[3])
workflows = int(sys.argv[4])

sys.path.insert(0, project_root)
sys.path.insert(0, os.path.join(project_root, "openai-agentic"))

from utils.db_utils import init_db, create_round
from main import Orchestrator


async def run_openai_method() -> None:
    init_db()

    for round_num in range(1, rounds + 1):
        print(f"\n{'=' * 70}")
        print(f"ROUND {round_num}/{rounds}")
        print(f"{'=' * 70}\n")

        round_id = create_round(total_emails=emails, status="running")
        if not round_id:
            print(f"Failed to create round {round_num}")
            continue

        print(f"Round created with ID: {round_id}\n")

        orchestrator = Orchestrator(round_id=round_id, num_parallel_workflows=workflows)
        result = await orchestrator.run_parallel_workflows(total_emails=emails)

        print(
            f"\nRound {round_num}: {result['total_succeeded']}/{result['total_processed']} "
            f"| Accuracy: {result['accuracy']:.2f}% | Cost: ${result['total_cost']:.6f}"
        )


def main() -> None:
    try:
        asyncio.run(run_openai_method())
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        sys.exit(1)
    except Exception as exc:
        print(f"\n\nError: {exc}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
PY
else
  python3 - "$SCRIPT_DIR" "$ROUNDS" "$EMAILS" <<'PY'
import asyncio
import builtins
import os
import sys

project_root = sys.argv[1]
rounds = int(sys.argv[2])
emails = int(sys.argv[3])

sys.path.insert(0, project_root)
sys.path.insert(0, os.path.join(project_root, "LLMs"))


async def run_semantic_kernels_method() -> None:
    original_input = builtins.input
    input_values = [str(rounds), str(emails)]

    def mock_input(prompt: str = "") -> str:
        print(prompt + input_values[0])
        return input_values.pop(0)

    builtins.input = mock_input
    try:
        from main import main as semantic_main

        await semantic_main()
    finally:
        builtins.input = original_input


def main() -> None:
    try:
        asyncio.run(run_semantic_kernels_method())
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        sys.exit(1)
    except Exception as exc:
        print(f"\n\nError: {exc}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
PY
fi