"""
Scan result cache module.

Provides a content-addressed Redis cache for phishing scan verdicts.
Cache keys are derived from email subject + body (SHA-256), so the same
content always maps to the same key regardless of which user submitted it.

Redis errors are treated as cache misses — a Redis outage must never
cause scan failures.
"""

import json
import hashlib
from datetime import datetime, timezone
from typing import Optional

_redis_client = None


def get_redis():
    """Lazy Redis connection — reuses the app's configured REDIS_URL."""
    global _redis_client
    if _redis_client is None:
        import redis
        from flask import current_app
        url = current_app.config.get('REDIS_URL', 'redis://localhost:6379/0')
        _redis_client = redis.from_url(url, decode_responses=True)
    return _redis_client


def make_scan_cache_key(subject: str, body: str) -> str:
    """
    Content-addressed cache key — same email content always maps to same key.

    Normalises whitespace at both ends before hashing so trailing spaces
    or newlines don't create spurious misses.
    """
    normalized = f"{subject.strip()}\n\n{body.strip()}"
    return f"scan:v1:{hashlib.sha256(normalized.encode()).hexdigest()}"


def get_scan_cache(subject: str, body: str) -> Optional[dict]:
    """
    Return cached verdict dict or None on cache miss / Redis error.

    Never raises — Redis unavailability is handled transparently.
    """
    try:
        key = make_scan_cache_key(subject, body)
        raw = get_redis().get(key)
        return json.loads(raw) if raw else None
    except Exception:
        return None  # Redis unavailable → treat as miss


def set_scan_cache(subject: str, body: str, result: dict, ttl: int = 3600) -> None:
    """
    Store verdict dict in Redis with a TTL.

    Silently ignores all errors — Redis unavailability must not block scans.
    """
    try:
        key = make_scan_cache_key(subject, body)
        get_redis().setex(key, ttl, json.dumps(result))
    except Exception:
        pass  # Redis unavailable → non-fatal


def get_cache_stats() -> dict:
    """
    Return basic stats about the scan cache.

    Returns:
        cached_keys  (int):  number of keys matching the scan:v1:* prefix
        available    (bool): False when Redis is unreachable
    """
    try:
        r = get_redis()
        keys = r.keys('scan:v1:*')
        return {'cached_keys': len(keys), 'available': True}
    except Exception:
        return {'cached_keys': 0, 'available': False}

# ---------------------------------------------------------------------------
# VirusTotal Cache & Rate Limiting
# ---------------------------------------------------------------------------

def make_vt_url_cache_key(url: str) -> str:
    """Calculate the cache key for a VirusTotal URL scan result."""
    return f"vt_url:v1:{hashlib.sha256(url.strip().encode('utf-8')).hexdigest()}"

def get_vt_cache(url: str) -> Optional[dict]:
    """Retrieve a cached VirusTotal scan result for a given URL."""
    try:
        key = make_vt_url_cache_key(url)
        raw = get_redis().get(key)
        return json.loads(raw) if raw else None
    except Exception:
        return None

def set_vt_cache(url: str, result: dict, ttl: int = 86400) -> None:
    """Store a VirusTotal scan result for a URL. Default TTL 24 hours."""
    try:
        key = make_vt_url_cache_key(url)
        get_redis().setex(key, ttl, json.dumps(result))
    except Exception:
        pass

def track_and_check_vt_quota(user_id: int, max_scans: int) -> bool:
    """
    Increment VT usage for a user today and return True if under quota.
    If Redis is unavailable, returns False to fail open defensively, 
    so we don't accidentally exhaust our global VT quota.
    """
    try:
        r = get_redis()
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        key = f"vt_quota:v1:{today}:{user_id}"
        
        # Check current count
        current = r.get(key)
        if current and int(current) >= max_scans:
            return False  # Over quota
            
        # Increment and set 24h expiry if new
        p = r.pipeline()
        p.incr(key)
        p.expire(key, 86400) # 24 hours
        p.execute()
        return True
    except Exception:
        # If cache fails, don't allow potentially unchecked VT calls
        return False
