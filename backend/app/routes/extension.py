"""
Browser extension instance API.

POST /api/extension/register       - Register a new extension instance (jwt required)
POST /api/extension/heartbeat      - Update last_seen via instance_token (no jwt)
GET  /api/extension/instances      - List current user's instances (jwt required)
GET  /api/extension/instances/all  - List all instances across users (admin only)
"""

from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import db, User
from app.models.extension_instance import ExtensionInstance
from app.errors import ValidationError, NotFoundError
from app.utils import require_role

extension_bp = Blueprint('extension', __name__)


# ---------------------------------------------------------------------------
# POST /api/extension/register
# ---------------------------------------------------------------------------

@extension_bp.route('/extension/register', methods=['POST'])
@jwt_required()
def register_instance():
    """
    Register a new extension instance for the authenticated user.

    Optional JSON body:
        browser (str): browser name/version, e.g. "Chrome 124"
        os_name (str): OS name/version, e.g. "Windows 11"

    Returns 201 with {id, instance_token, browser, os_name, created_at}.
    """
    identity = get_jwt_identity()
    data = request.get_json(silent=True) or {}

    instance = ExtensionInstance(
        user_id=int(identity),
        browser=data.get('browser'),
        os_name=data.get('os_name'),
        last_seen=datetime.now(timezone.utc),
    )
    db.session.add(instance)
    db.session.commit()

    return jsonify({
        'success': True,
        'data': instance.to_dict(),
    }), 201


# ---------------------------------------------------------------------------
# POST /api/extension/heartbeat
# ---------------------------------------------------------------------------

@extension_bp.route('/extension/heartbeat', methods=['POST'])
def heartbeat():
    """
    Update last_seen for an extension instance using its token.

    This endpoint is intentionally unauthenticated — the extension only needs
    to store its instance_token (not a full JWT) to send heartbeats.

    JSON body (required):
        instance_token (str): the token returned at registration

    Returns 200 on success, 404 if token not found.
    """
    data = request.get_json(silent=True) or {}
    token = data.get('instance_token', '').strip()
    if not token:
        raise ValidationError('instance_token is required')

    instance = ExtensionInstance.query.filter_by(instance_token=token).first()
    if not instance:
        raise NotFoundError('Extension instance not found')

    instance.last_seen = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify({'success': True, 'is_active': instance.is_active}), 200


# ---------------------------------------------------------------------------
# GET /api/extension/instances
# ---------------------------------------------------------------------------

@extension_bp.route('/extension/instances', methods=['GET'])
@jwt_required()
def list_my_instances():
    """
    Return all extension instances for the authenticated user, newest first.
    """
    identity = get_jwt_identity()
    instances = (
        ExtensionInstance.query
        .filter_by(user_id=int(identity))
        .order_by(ExtensionInstance.created_at.desc())
        .all()
    )
    return jsonify({
        'success': True,
        'data': [i.to_dict() for i in instances],
    }), 200


# ---------------------------------------------------------------------------
# GET /api/extension/instances/all
# ---------------------------------------------------------------------------

@extension_bp.route('/extension/instances/all', methods=['GET'])
@jwt_required()
def list_all_instances():
    """
    Return all extension instances across all users (admin only), newest first.

    Each item includes nested user info (username, email).
    """
    forbidden = require_role('admin', 'super_admin')
    if forbidden:
        return forbidden

    instances = (
        ExtensionInstance.query
        .order_by(ExtensionInstance.last_seen.desc().nullslast())
        .all()
    )

    result = []
    for inst in instances:
        d = inst.to_dict()
        if inst.user:
            d['user'] = {
                'id': inst.user.id,
                'username': inst.user.username,
                'email': inst.user.email,
            }
        result.append(d)

    active_count = sum(1 for inst in instances if inst.is_active)

    return jsonify({
        'success': True,
        'total': len(instances),
        'active': active_count,
        'data': result,
    }), 200
