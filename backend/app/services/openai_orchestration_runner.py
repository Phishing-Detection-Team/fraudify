"""
Run OpenAI Agents SDK orchestration from the Flask app process (background thread).

Uses the same Flask app instance and DB binding as the API so SQLAlchemy and
config match the running server.
"""

from __future__ import annotations

import asyncio
import os
import sys
import traceback
from datetime import datetime, timezone


def _project_root() -> str:
    return os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))


def run_openai_round_in_thread(
    app,
    round_id: int,
    total_emails: int,
    num_workflows: int,
) -> None:
    """
    Execute `run_orchestrated_round` for an existing round.

    Intended to run inside a daemon thread started from a route handler.
    """
    root = _project_root()
    if root not in sys.path:
        sys.path.insert(0, root)
    oa_dir = os.path.join(root, 'openai-agentic')
    if oa_dir not in sys.path:
        sys.path.insert(0, oa_dir)

    from utils.db_utils import bind_flask_app
    from main import run_orchestrated_round

    bind_flask_app(app)

    try:
        asyncio.run(
            run_orchestrated_round(
                round_id=round_id,
                total_emails=total_emails,
                num_workflows=num_workflows,
            )
        )
    except Exception as exc:  # noqa: BLE001 — log and mark round failed
        app.logger.error(
            'OpenAI orchestration failed for round %s: %s\n%s',
            round_id,
            exc,
            traceback.format_exc(),
        )
        with app.app_context():
            from app.models import db, Round

            round_obj = db.session.get(Round, round_id)
            if round_obj:
                round_obj.status = 'failed'
                round_obj.completed_at = datetime.now(timezone.utc)
                db.session.commit()
