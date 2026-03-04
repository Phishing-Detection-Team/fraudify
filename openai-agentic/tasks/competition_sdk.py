"""
Local script for running agentic orchestration and gathering datasets.
"""

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from agents_sdk.orchestrator import run_orchestrated_round
import json

if __name__ == "__main__":
    round_id = int(input("Enter round ID: "))
    total_emails = int(input("Enter number of emails to process: "))
    results = run_orchestrated_round(round_id, total_emails)
    print("\n--- Results ---")
    print(results)
    # Optionally save results to file for dataset
    with open(f"dataset_round_{round_id}.json", "w") as f:
        json.dump(results, f, indent=2)