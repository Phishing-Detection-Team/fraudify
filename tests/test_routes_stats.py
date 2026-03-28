"""Tests for the stats blueprint: GET /api/stats and GET /api/agents."""

import pytest
from datetime import datetime


# ---------------------------------------------------------------------------
# GET /api/stats
# ---------------------------------------------------------------------------

class TestGetStats:
    def test_stats_requires_jwt(self, client, db):
        resp = client.get('/api/stats')
        assert resp.status_code == 401

    def test_stats_empty_db_returns_zeros(self, client, db, sample_user, auth_headers_user):
        resp = client.get('/api/stats', headers=auth_headers_user)
        assert resp.status_code == 200
        data = resp.get_json()['data']
        assert data['total_api_cost'] == 0
        assert data['total_emails_scanned'] == 0
        assert data['threats_detected'] == 0

    def test_stats_response_shape(self, client, db, sample_user, auth_headers_user):
        resp = client.get('/api/stats', headers=auth_headers_user)
        assert resp.status_code == 200
        data = resp.get_json()['data']
        for key in ('total_api_cost', 'active_agents', 'total_emails_scanned', 'threats_detected'):
            assert key in data, f"Missing key: {key}"

    def test_stats_active_agents_is_two(self, client, db, sample_user, auth_headers_user):
        resp = client.get('/api/stats', headers=auth_headers_user)
        assert resp.get_json()['data']['active_agents'] == 2

    def test_stats_counts_phishing_threats(
        self, client, db, sample_user, sample_email, auth_headers_user
    ):
        """sample_email has detector_verdict='phishing', so threats_detected should be 1."""
        resp = client.get('/api/stats', headers=auth_headers_user)
        assert resp.status_code == 200
        data = resp.get_json()['data']
        assert data['threats_detected'] == 1

    def test_stats_counts_emails_scanned(
        self, client, db, sample_user, sample_round, auth_headers_user
    ):
        """sample_round has processed_emails=0 by default; after bumping it the stat updates."""
        from app.models import Round as _Round
        sample_round.processed_emails = 5
        db.session.commit()

        resp = client.get('/api/stats', headers=auth_headers_user)
        data = resp.get_json()['data']
        assert data['total_emails_scanned'] == 5

    def test_stats_api_cost_sum(
        self, client, db, sample_user, sample_api_call, auth_headers_user
    ):
        """sample_api_call has cost=0.001, so total_api_cost should reflect it."""
        resp = client.get('/api/stats', headers=auth_headers_user)
        data = resp.get_json()['data']
        assert data['total_api_cost'] == pytest.approx(0.001, rel=1e-4)

    def test_stats_success_flag(self, client, db, sample_user, auth_headers_user):
        resp = client.get('/api/stats', headers=auth_headers_user)
        assert resp.get_json()['success'] is True


# ---------------------------------------------------------------------------
# GET /api/agents
# ---------------------------------------------------------------------------

class TestGetAgents:
    def test_agents_requires_jwt(self, client, db):
        resp = client.get('/api/agents')
        assert resp.status_code == 401

    def test_agents_returns_list(self, client, db, sample_user, auth_headers_user):
        resp = client.get('/api/agents', headers=auth_headers_user)
        assert resp.status_code == 200
        data = resp.get_json()['data']
        assert isinstance(data, list)
        assert len(data) > 0

    def test_agents_each_has_required_fields(self, client, db, sample_user, auth_headers_user):
        resp = client.get('/api/agents', headers=auth_headers_user)
        for agent in resp.get_json()['data']:
            for key in ('id', 'name', 'model', 'status'):
                assert key in agent, f"Missing key: {key}"

    def test_agents_each_has_live_stats_fields(self, client, db, sample_user, auth_headers_user):
        resp = client.get('/api/agents', headers=auth_headers_user)
        for agent in resp.get_json()['data']:
            for key in ('call_count', 'total_tokens', 'total_cost', 'last_active'):
                assert key in agent, f"Missing live stats key: {key}"

    def test_agents_call_count_zero_by_default(
        self, client, db, sample_user, auth_headers_user
    ):
        resp = client.get('/api/agents', headers=auth_headers_user)
        for agent in resp.get_json()['data']:
            assert agent['call_count'] == 0
            assert agent['last_active'] is None

    def test_agents_call_count_increments_with_api_call(
        self, client, db, sample_user, sample_api_call, auth_headers_user
    ):
        """sample_api_call has agent_type='generator'; generator call_count should be 1."""
        resp = client.get('/api/agents', headers=auth_headers_user)
        agents_by_id = {a['id']: a for a in resp.get_json()['data']}
        assert agents_by_id['generator']['call_count'] == 1
        assert agents_by_id['detector']['call_count'] == 0

    def test_agents_last_active_is_iso_string(
        self, client, db, sample_user, sample_api_call, auth_headers_user
    ):
        resp = client.get('/api/agents', headers=auth_headers_user)
        agents_by_id = {a['id']: a for a in resp.get_json()['data']}
        last_active = agents_by_id['generator']['last_active']
        assert last_active is not None
        datetime.fromisoformat(last_active)  # Should not raise

    def test_agents_total_cost_reflects_api_call(
        self, client, db, sample_user, sample_api_call, auth_headers_user
    ):
        resp = client.get('/api/agents', headers=auth_headers_user)
        agents_by_id = {a['id']: a for a in resp.get_json()['data']}
        assert agents_by_id['generator']['total_cost'] == pytest.approx(0.001, rel=1e-4)

    def test_agents_success_flag(self, client, db, sample_user, auth_headers_user):
        resp = client.get('/api/agents', headers=auth_headers_user)
        assert resp.get_json()['success'] is True
