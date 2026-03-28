"""
User management API (admin only).

GET /api/users  - Paginated list of all users
"""

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.models import db, User
from app.utils import require_role

users_bp = Blueprint('users', __name__)


@users_bp.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    """
    Return a paginated list of all users.

    Query params:
        page     (int, default 1)
        per_page (int, default 20, max 100)

    Requires admin or super_admin role.
    """
    forbidden = require_role('admin', 'super_admin')
    if forbidden:
        return forbidden

    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)

    pagination = User.query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    items = [
        {
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'roles': [r.name for r in u.roles],
            'is_active': u.is_active,
            'created_at': u.created_at.isoformat() if u.created_at else None,
        }
        for u in pagination.items
    ]

    return jsonify({
        'success': True,
        'items': items,
        'total': pagination.total,
        'page': pagination.page,
        'pages': pagination.pages,
        'per_page': pagination.per_page,
    }), 200
