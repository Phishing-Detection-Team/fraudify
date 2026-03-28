"""Tests for ExtensionInstance model."""

import pytest
from datetime import datetime, timedelta, timezone

from app.models import db, User
from app.models.extension_instance import ExtensionInstance


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_instance(db, user, last_seen=None, browser='Firefox 125', os_name='macOS 14'):
    """Create and persist an ExtensionInstance for the given user."""
    inst = ExtensionInstance(
        user_id=user.id,
        browser=browser,
        os_name=os_name,
        last_seen=last_seen,
    )
    db.session.add(inst)
    db.session.commit()
    return inst


# ---------------------------------------------------------------------------
# Token generation
# ---------------------------------------------------------------------------

class TestTokenGeneration:
    def test_default_token_generated(self, db, sample_user):
        """instance_token is set automatically on creation (no explicit value)."""
        inst = _make_instance(db, sample_user)
        assert inst.instance_token is not None
        assert len(inst.instance_token) == 32  # uuid4().hex is 32 hex chars

    def test_token_is_unique(self, db, sample_user):
        """Two instances for the same user get different tokens."""
        inst1 = _make_instance(db, sample_user)
        inst2 = _make_instance(db, sample_user)
        assert inst1.instance_token != inst2.instance_token

    def test_explicit_token_stored(self, db, sample_user):
        """An explicitly provided token is persisted as-is."""
        custom_token = 'abcdef1234567890abcdef1234567890'
        inst = ExtensionInstance(user_id=sample_user.id, instance_token=custom_token)
        db.session.add(inst)
        db.session.commit()
        assert inst.instance_token == custom_token


# ---------------------------------------------------------------------------
# is_active property
# ---------------------------------------------------------------------------

class TestIsActive:
    def test_is_active_when_recent_heartbeat(self, db, sample_user):
        """is_active is True when last_seen is 1 minute ago."""
        one_minute_ago = datetime.now(timezone.utc) - timedelta(minutes=1)
        inst = _make_instance(db, sample_user, last_seen=one_minute_ago)
        assert inst.is_active is True

    def test_is_inactive_when_stale_heartbeat(self, db, sample_user):
        """is_active is False when last_seen is 10 minutes ago (beyond 5-min window)."""
        ten_min_ago = datetime.now(timezone.utc) - timedelta(minutes=10)
        inst = _make_instance(db, sample_user, last_seen=ten_min_ago)
        assert inst.is_active is False

    def test_is_inactive_when_no_heartbeat(self, db, sample_user):
        """is_active is False when last_seen is None (never received a heartbeat)."""
        inst = _make_instance(db, sample_user, last_seen=None)
        assert inst.is_active is False

    def test_is_active_at_exactly_five_minutes(self, db, sample_user):
        """is_active is False at exactly 5 minutes (cutoff is strictly >5 min old)."""
        exactly_five = datetime.now(timezone.utc) - timedelta(minutes=5)
        inst = _make_instance(db, sample_user, last_seen=exactly_five)
        # last_seen == cutoff, so not strictly >= cutoff → inactive
        assert inst.is_active is False

    def test_is_active_handles_naive_last_seen(self, db, sample_user):
        """is_active works when last_seen is a naive datetime (no tzinfo)."""
        naive_recent = datetime.utcnow() - timedelta(minutes=1)
        inst = _make_instance(db, sample_user, last_seen=naive_recent)
        assert inst.is_active is True


# ---------------------------------------------------------------------------
# to_dict
# ---------------------------------------------------------------------------

class TestToDict:
    def test_to_dict_contains_expected_keys(self, db, sample_user):
        """to_dict() contains all required keys."""
        inst = _make_instance(
            db, sample_user,
            last_seen=datetime.now(timezone.utc),
        )
        d = inst.to_dict()
        expected_keys = {
            'id', 'user_id', 'instance_token', 'browser',
            'os_name', 'last_seen', 'created_at', 'is_active',
        }
        assert expected_keys <= d.keys()

    def test_to_dict_is_active_flag(self, db, sample_user):
        """to_dict reflects is_active as a boolean."""
        inst = _make_instance(db, sample_user, last_seen=datetime.now(timezone.utc))
        d = inst.to_dict()
        assert d['is_active'] is True

    def test_to_dict_null_last_seen(self, db, sample_user):
        """to_dict returns None for last_seen when no heartbeat received."""
        inst = _make_instance(db, sample_user, last_seen=None)
        assert inst.to_dict()['last_seen'] is None

    def test_to_dict_iso_strings(self, db, sample_user):
        """last_seen and created_at are serialised as ISO 8601 strings."""
        last_seen = datetime.now(timezone.utc)
        inst = _make_instance(db, sample_user, last_seen=last_seen)
        d = inst.to_dict()
        # Should not raise ValueError
        datetime.fromisoformat(d['last_seen'])
        datetime.fromisoformat(d['created_at'])

    def test_to_dict_user_id_matches(self, db, sample_user):
        """to_dict['user_id'] matches the owning user's id."""
        inst = _make_instance(db, sample_user)
        assert inst.to_dict()['user_id'] == sample_user.id


# ---------------------------------------------------------------------------
# Cascade delete
# ---------------------------------------------------------------------------

class TestCascadeDelete:
    def test_instance_deleted_with_user(self, db, sample_user, sample_role_user):
        """Deleting a user cascades to their extension instances."""
        inst = _make_instance(db, sample_user)
        inst_id = inst.id

        # Detach the role first so the delete isn't blocked by FK to roles
        sample_user.roles = []
        db.session.commit()

        db.session.delete(sample_user)
        db.session.commit()

        remaining = db.session.get(ExtensionInstance, inst_id)
        assert remaining is None

    def test_deleting_instance_does_not_delete_user(self, db, sample_user):
        """Deleting an instance does not cascade back to the owning user."""
        inst = _make_instance(db, sample_user)
        user_id = sample_user.id

        db.session.delete(inst)
        db.session.commit()

        assert db.session.get(User, user_id) is not None


# ---------------------------------------------------------------------------
# Repr
# ---------------------------------------------------------------------------

class TestRepr:
    def test_repr_contains_token_prefix(self, db, sample_user):
        """__repr__ includes the first 8 chars of the token."""
        inst = _make_instance(db, sample_user)
        r = repr(inst)
        assert inst.instance_token[:8] in r
