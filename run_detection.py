"""
Phishing Detection System - Consolidation Script
=================================================

Unified CLI interface to run either OpenAI Agents SDK or Semantic Kernels implementation.

Usage:
    python run_detection.py --method openai --rounds 3 --emails 10 --workflows 2
    python run_detection.py --method semantic-kernels --rounds 3 --emails 10
"""

import argparse
import asyncio
import sys
import os

# Add project root to path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)


async def run_openai_method(rounds: int, emails: int, workflows: int):
    """Run OpenAI Agents SDK implementation."""
    sys.path.insert(0, os.path.join(project_root, 'openai-agentic'))
    
    from utils.db_utils import init_db, create_round
    from main import Orchestrator
    
    init_db()
    
    for round_num in range(1, rounds + 1):
        print(f"\n{'=' * 70}")
        print(f"📝 ROUND {round_num}/{rounds}")
        print(f"{'=' * 70}\n")
        
        round_id = create_round(total_emails=emails, status='running')
        if not round_id:
            print(f"❌ Failed to create round {round_num}")
            continue
        
        print(f"✅ Round created with ID: {round_id}\n")
        
        orchestrator = Orchestrator(round_id=round_id, num_parallel_workflows=workflows)
        result = await orchestrator.run_parallel_workflows(total_emails=emails)
        
        print(f"\n✅ Round {round_num}: {result['total_succeeded']}/{result['total_processed']} "
              f"| Accuracy: {result['accuracy']:.2f}% | Cost: ${result['total_cost']:.6f}")


async def run_semantic_kernels_method(rounds: int, emails: int):
    """Run Semantic Kernels implementation."""
    sys.path.insert(0, os.path.join(project_root, 'LLMs'))
    
    # Monkey-patch input() to provide programmatic values
    original_input = __builtins__.input
    input_values = [str(rounds), str(emails)]
    
    def mock_input(prompt=""):
        print(prompt + input_values[0])
        return input_values.pop(0)
    
    __builtins__.input = mock_input
    
    try:
        # Call the existing main() function from LLMs/main.py
        from main import main as semantic_main
        await semantic_main()
    finally:
        __builtins__.input = original_input


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Phishing Detection - Unified Runner',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='Examples:\n'
               '  python run_detection.py --method openai --rounds 3 --emails 10 --workflows 2\n'
               '  python run_detection.py --method semantic-kernels --rounds 3 --emails 10'
    )
    
    parser.add_argument('--method', required=True, choices=['openai', 'semantic-kernels'],
                       help='Implementation method')
    parser.add_argument('--rounds', type=int, required=True, help='Number of rounds')
    parser.add_argument('--emails', type=int, required=True, help='Emails per round')
    parser.add_argument('--workflows', type=int, default=2,
                       help='Parallel workflows (OpenAI only, default: 2)')
    
    args = parser.parse_args()
    
    print("=" * 70)
    print("🚀 PHISHING DETECTION SYSTEM")
    print("=" * 70)
    print(f"Method: {args.method.upper()} | Rounds: {args.rounds} | "
          f"Emails/Round: {args.emails}", end="")
    if args.method == 'openai':
        print(f" | Workflows: {args.workflows}")
    else:
        print()
    print("=" * 70)
    
    try:
        if args.method == 'openai':
            asyncio.run(run_openai_method(args.rounds, args.emails, args.workflows))
        else:
            asyncio.run(run_semantic_kernels_method(args.rounds, args.emails))
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
