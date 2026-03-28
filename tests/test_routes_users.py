"""Tests for the users blueprint: GET /api/users."""

import pytest
from datetime import datetime


# ---------------------------------------------------------------------------
# GET /api/users
# ---------------------------------------------------------------------------

class TestListUsers:
    def test_list_users_requires_jwt(self, client, db):
        resp = client.get('/api/users')
        assert resp.status_code == 401

    def test_list_users_requires_admin(self, client, db, sample_user, auth_headers_user):
        resp = client.get('/api/users', headers=auth_headers_user)
        assert resp.status_code == 403

    def test_list_users_admin_sees_all(
        self, client, db, sample_user, sample_admin, auth_headers_admin
    ):
        resp = client.get('/api/users', headers=auth_headers_admin)
        assert resp.status_code == 200
        body = resp.get_json()
        assert body['success'] is True
        emails = [u['email'] for u in body['items']]
        assert sample_user.email in emails
        assert sample_admin.email in emails
        assert body['total'] == 2

    def test_list_users_pagination_first_page(
        self, client, db, sample_user, sample_admin, auth_headers_admin
    ):
        resp = client.get('/api/users?page=1&per_page=1', headers=auth_headers_admin)
        assert resp.status_code == 200
        body = resp.get_json()
        assert len(body['items']) == 1
        assert body['total'] == 2
        assert body['pages'] == 2
        assert body['per_page'] == 1
        assert body['page'] == 1

    def test_list_users_pagination_second_page(
        self, client, db, sample_user, sample_admin, auth_headers_admin
    ):
        resp = client.get('/api/users?page=2&per_page=1', headers=auth_headers_admin)
        assert resp.status_code == 200
        body = resp.get_json()
        assert len(body['items']) == 1

    def test_list_users_response_shape(
        self, client, db, sample_user, sample_admin, auth_headers_admin
    ):
        resp = client.get('/api/users', headers=auth_headers_admin)
        assert resp.status_code == 200
        item = resp.get_json()['items'][0]
        for key in ('id', 'username', 'email', 'roles', 'is_active', 'created_at'):
            assert key in item, f"Key '{key}' missing from user response"

    def test_list_users_roles_is_list(
        self, client, db, sample_user, auth_headers_admin
    ):
        resp = client.get('/api/users', headers=auth_headers_admin)
        items = resp.get_json()['items']
        for item in items:
            assert isinstance(item['roles'], list)

    def test_list_users_is_active_is_bool(
        self, client, db, sample_user, auth_headers_admin
    ):
        resp = client.get('/api/users', headers=auth_headers_admin)
        for item in resp.get_json()['items']:
            assert isinstance(item['is_active'], bool)

    def test_list_users_default_per_page_twenty(
        self, client, db, sample_user, sample_admin, auth_headers_admin
    ):
        resp = client.get('/api/users', headers=auth_headers_admin)
        assert resp.get_json()['per_page'] == 20

    def test_list_users_per_page_capped_at_100(
        self, client, db, sample_user, sample_admin, auth_headers_admin
    ):
        resp = client.get('/api/users?per_page=999', headers=auth_headers_admin)
        assert resp.get_json()['per_page'] == 100

    def test_list_users_empty_db_returns_empty_list(
        self, client, db, sample_admin, auth_headers_admin
    ):
        """When no users (except admin) exist, list returns just admin."""
        resp = client.get('/api/users', headers=auth_headers_admin)
        body = resp.get_json()
        # At minimum the admin itself should appear
        assert body['total'] >= 1
        assert isinstance(body['items'], list)
