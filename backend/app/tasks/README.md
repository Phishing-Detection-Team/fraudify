# Async Task Queue (Celery — TODO)

This directory is the planned home for Celery tasks.

## Current State

All background work is handled by raw `threading.Thread` in
`backend/app/services/openai_orchestration_runner.py`. This is acceptable for
MVP but has two limitations:

1. **No retry logic** — if the AI pipeline fails mid-run, the round is marked
   failed and the incomplete work is lost.
2. **Process-bound** — threads are killed when the Flask process exits, leaving
   rounds stuck in `running` status.

## Planned Migration

Replace `threading.Thread` with Celery tasks backed by Redis (already in the
stack as the JWT blocklist store).

### New tasks to add here

| Task | Description |
|------|-------------|
| `run_round.py` | Celery task wrapping `openai_orchestration_runner.run()` |
| `scan_email.py` | Celery task for `POST /api/scan` — returns a `job_id` immediately, result polled by client |
| `batch_inbox_scan.py` | Future: proactively scan stored Gmail/Outlook OAuth inboxes |

### Required additions

```
# requirements.txt
celery[redis]>=5.3.0
```

```python
# backend/app/__init__.py
from celery import Celery

def make_celery(app):
    celery = Celery(app.import_name, broker=app.config['REDIS_URL'])
    celery.conf.update(app.config)
    return celery

celery = make_celery(app)
```

```bash
# Start worker (separate process alongside Flask)
celery -A app.tasks worker --loglevel=info
```

### Extension scan flow after migration

```
POST /api/scan
  → enqueue scan_email task → return {job_id}
  ← 202 Accepted

GET /api/scan/<job_id>/result
  → poll until task complete → return verdict
```

## References

- Flask-Limiter docs: https://flask-limiter.readthedocs.io
- Celery docs: https://docs.celeryq.dev
- Redis already configured at: `REDIS_URL` in `.env`
