"""ExtensionInstance model — tracks browser extension registrations per user."""

import uuid
from datetime import datetime, timezone, timedelta

from . import db


def _generate_token():
    return uuid.uuid4().hex


class ExtensionInstance(db.Model):
    """One row per browser extension installation registered by a user."""

    __tablename__ = 'extension_instances'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )
    instance_token = db.Column(
        db.String(64),
        unique=True,
        nullable=False,
        default=_generate_token,
    )
    browser = db.Column(db.String(50))   # e.g. "Chrome 124"
    os_name = db.Column(db.String(50))   # e.g. "Windows 11"
    last_seen = db.Column(db.DateTime, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship(
        'User',
        backref=db.backref('extension_instances', lazy='dynamic', cascade='all, delete-orphan'),
    )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @property
    def is_active(self) -> bool:
        """True if the instance sent a heartbeat within the last 5 minutes."""
        if not self.last_seen:
            return False
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=5)
        last = self.last_seen
        if last.tzinfo is None:
            last = last.replace(tzinfo=timezone.utc)
        return last >= cutoff

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'user_id': self.user_id,
            'instance_token': self.instance_token,
            'browser': self.browser,
            'os_name': self.os_name,
            'last_seen': self.last_seen.isoformat() if self.last_seen else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active,
        }

    def __repr__(self):
        return f'<ExtensionInstance {self.instance_token[:8]}… user={self.user_id}>'
