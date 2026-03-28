"""Shared authorization helpers used across route blueprints."""

from flask import jsonify
from flask_jwt_extended import get_jwt_identity

from app.models import db, User


def require_role(*role_names):
    """
    Check that the current JWT identity has at least one of the given roles.

    Returns a 403 JSON response tuple if the check fails, or None on success.
    Call at the top of a protected view function and return early if not None:

        forbidden = require_role('admin', 'super_admin')
        if forbidden:
            return forbidden
    """
    identity = get_jwt_identity()
    user = db.session.get(User, int(identity))
    if not user or not any(user.has_role(r) for r in role_names):
        return (
            jsonify({'success': False, 'error': 'Forbidden', 'message': 'Insufficient role'}),
            403,
        )
    return None
