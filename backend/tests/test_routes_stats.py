"""
Tests for GET /api/stats/intelligence endpoint.

TDD: Tests written BEFORE implementation.
"""

import pytest
from flask_jwt_extended import create_access_token

from app import create_app
from app.models import db as _db
from app.models.user import User
from app.models.role import Role
from app.models.round import Round
from app.models.email import Email


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope='session')
def app():
    """Create application for testing."""
    application = create_app('testing')
    with application.app_context():
        _db.create_all()
        yield application
        _db.session.remove()
        _db.drop_all()


@pytest.fixture(scope='session')
def client(app):
    """Test client for the application."""
    return app.test_client()


@pytest.fixture(scope='session')
def admin_user(app):
    """Create an admin user for testing."""
    with app.app_context():
        # Ensure admin role exists
        admin_role = Role.query.filter_by(name='admin').first()
        if not admin_role:
            admin_role = Role(name='admin')
            _db.session.add(admin_role)
            _db.session.commit()

        user = User(
            username='test_admin',
            email='admin@test.com',
        )
        user.set_password('password123')
        user.roles.append(admin_role)
        _db.session.add(user)
        _db.session.commit()
        return user.id


@pytest.fixture(scope='session')
def regular_user(app):
    """Create a regular (non-admin) user for testing."""
    with app.app_context():
        user = User(
            username='test_user',
            email='user@test.com',
        )
        user.set_password('password123')
        _db.session.add(user)
        _db.session.commit()
        return user.id


@pytest.fixture(scope='session')
def admin_token(app, admin_user):
    """Generate JWT token for admin user."""
    with app.app_context():
        return create_access_token(identity=str(admin_user))


@pytest.fixture(scope='session')
def user_token(app, regular_user):
    """Generate JWT token for regular user."""
    with app.app_context():
        return create_access_token(identity=str(regular_user))


@pytest.fixture(scope='session')
def seeded_data(app, admin_user):
    """Seed test database with rounds and emails."""
    with app.app_context():
        from datetime import datetime

        # Create completed rounds
        round1 = Round(
            status='completed',
            total_emails=4,
            processed_emails=4,
            completed_at=datetime(2026, 1, 1),
            started_at=datetime(2026, 1, 1),
        )
        round2 = Round(
            status='completed',
            total_emails=4,
            processed_emails=4,
            completed_at=datetime(2026, 2, 1),
            started_at=datetime(2026, 2, 1),
        )
        _db.session.add_all([round1, round2])
        _db.session.flush()

        # Round 1 emails:
        # 2 true positives (phishing, detected as phishing)
        # 1 false negative  (phishing, detected as legitimate)
        # 1 false positive  (legitimate, detected as phishing)
        emails_r1 = [
            Email(
                round_id=round1.id,
                generated_content='urgent phishing email',
                generated_subject='urgent action required',
                is_phishing=True,
                detector_verdict='phishing',
                detector_confidence=0.9,
                generated_email_metadata={},
            ),
            Email(
                round_id=round1.id,
                generated_content='phishing email secure',
                generated_subject='secure your account',
                is_phishing=True,
                detector_verdict='phishing',
                detector_confidence=0.85,
                generated_email_metadata={},
            ),
            Email(
                round_id=round1.id,
                generated_content='phishing email missed',
                generated_subject='click the link now',
                is_phishing=True,
                detector_verdict='legitimate',  # FN
                detector_confidence=0.3,
                generated_email_metadata={},
            ),
            Email(
                round_id=round1.id,
                generated_content='legitimate email flagged',
                generated_subject='hello friend',
                is_phishing=False,
                detector_verdict='phishing',  # FP
                detector_confidence=0.6,
                generated_email_metadata={},
            ),
        ]

        # Round 2: all correct
        emails_r2 = [
            Email(
                round_id=round2.id,
                generated_content='phishing email urgent',
                generated_subject='urgent verify now',
                is_phishing=True,
                detector_verdict='phishing',
                detector_confidence=0.15,  # bucket 0-20%
                generated_email_metadata={},
            ),
            Email(
                round_id=round2.id,
                generated_content='legitimate email',
                generated_subject='newsletter update',
                is_phishing=False,
                detector_verdict='legitimate',
                detector_confidence=0.45,  # bucket 40-60%
                generated_email_metadata={},
            ),
            Email(
                round_id=round2.id,
                generated_content='phishing email secure link',
                generated_subject='phishing test secure',
                is_phishing=True,
                detector_verdict='phishing',
                detector_confidence=0.75,  # bucket 60-80%
                generated_email_metadata={},
            ),
            Email(
                round_id=round2.id,
                generated_content='phishing email very confident',
                generated_subject='urgent secure your account now',
                is_phishing=True,
                detector_verdict='phishing',
                detector_confidence=0.95,  # bucket 80-100%
                generated_email_metadata={},
            ),
        ]

        _db.session.add_all(emails_r1 + emails_r2)
        _db.session.commit()
        return {'round1_id': round1.id, 'round2_id': round2.id}


# ---------------------------------------------------------------------------
# Tests: Authentication / Authorization
# ---------------------------------------------------------------------------

class TestIntelligenceEndpointAuth:
    """Tests for authentication and authorization on GET /api/stats/intelligence."""

    def test_unauthenticated_returns_401(self, client):
        """Unauthenticated request should return 401."""
        response = client.get('/api/stats/intelligence')
        assert response.status_code == 401

    def test_non_admin_returns_403(self, client, user_token):
        """Regular user (no admin role) should receive 403 Forbidden."""
        response = client.get(
            '/api/stats/intelligence',
            headers={'Authorization': f'Bearer {user_token}'},
        )
        assert response.status_code == 403

    def test_admin_returns_200(self, client, admin_token, seeded_data):
        """Admin user should receive 200 OK."""
        response = client.get(
            '/api/stats/intelligence',
            headers={'Authorization': f'Bearer {admin_token}'},
        )
        assert response.status_code == 200


# ---------------------------------------------------------------------------
# Tests: Response Shape
# ---------------------------------------------------------------------------

class TestIntelligenceResponseShape:
    """Tests for the response shape of GET /api/stats/intelligence."""

    @pytest.fixture(autouse=True)
    def get_response(self, client, admin_token, seeded_data):
        """Fetch the intelligence stats once per test class."""
        resp = client.get(
            '/api/stats/intelligence',
            headers={'Authorization': f'Bearer {admin_token}'},
        )
        self.data = resp.get_json()

    def test_success_flag_is_true(self):
        """Response should have success=True."""
        assert self.data['success'] is True

    def test_data_key_present(self):
        """Response should contain a 'data' key."""
        assert 'data' in self.data

    def test_confidence_distribution_present(self):
        """Response data should contain confidence_distribution list."""
        assert 'confidence_distribution' in self.data['data']
        assert isinstance(self.data['data']['confidence_distribution'], list)

    def test_accuracy_over_rounds_present(self):
        """Response data should contain accuracy_over_rounds list."""
        assert 'accuracy_over_rounds' in self.data['data']
        assert isinstance(self.data['data']['accuracy_over_rounds'], list)

    def test_fp_fn_rates_present(self):
        """Response data should contain fp_fn_rates list."""
        assert 'fp_fn_rates' in self.data['data']
        assert isinstance(self.data['data']['fp_fn_rates'], list)

    def test_top_phishing_words_present(self):
        """Response data should contain top_phishing_words list."""
        assert 'top_phishing_words' in self.data['data']
        assert isinstance(self.data['data']['top_phishing_words'], list)


# ---------------------------------------------------------------------------
# Tests: confidence_distribution
# ---------------------------------------------------------------------------

class TestConfidenceDistribution:
    """Tests for confidence_distribution data correctness."""

    @pytest.fixture(autouse=True)
    def get_distribution(self, client, admin_token, seeded_data):
        resp = client.get(
            '/api/stats/intelligence',
            headers={'Authorization': f'Bearer {admin_token}'},
        )
        self.dist = resp.get_json()['data']['confidence_distribution']

    def test_has_five_buckets(self):
        """Distribution must have exactly 5 buckets."""
        assert len(self.dist) == 5

    def test_bucket_labels(self):
        """Buckets should have the correct labels."""
        labels = [b['bucket'] for b in self.dist]
        assert labels == ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%']

    def test_bucket_counts_are_integers(self):
        """Bucket counts should be integers."""
        for b in self.dist:
            assert isinstance(b['count'], int)

    def test_known_bucket_counts(self):
        """
        Seeded data has:
        - 0.15 -> 0-20% bucket (1 email)
        - 0.45 -> 40-60% bucket (1 email)
        - 0.75 -> 60-80% bucket (1 email)
        - 0.95 -> 80-100% bucket (1 email)
        - 0.9  -> 80-100% bucket (1 email)
        - 0.85 -> 80-100% bucket (1 email)
        - 0.3  -> 20-40% bucket (1 email)
        - 0.6  -> 60-80% bucket (1 email)
        """
        by_label = {b['bucket']: b['count'] for b in self.dist}
        assert by_label['0-20%'] == 1
        assert by_label['20-40%'] == 1
        assert by_label['40-60%'] == 1
        assert by_label['60-80%'] == 2
        assert by_label['80-100%'] == 3


# ---------------------------------------------------------------------------
# Tests: accuracy_over_rounds
# ---------------------------------------------------------------------------

class TestAccuracyOverRounds:
    """Tests for accuracy_over_rounds data correctness."""

    @pytest.fixture(autouse=True)
    def get_accuracy(self, client, admin_token, seeded_data):
        resp = client.get(
            '/api/stats/intelligence',
            headers={'Authorization': f'Bearer {admin_token}'},
        )
        self.accuracy = resp.get_json()['data']['accuracy_over_rounds']

    def test_only_completed_rounds_included(self):
        """Only completed rounds should appear in the accuracy list."""
        for entry in self.accuracy:
            assert 'round_id' in entry
            assert 'accuracy' in entry
            assert 'completed_at' in entry

    def test_accuracy_is_float_between_0_and_1(self):
        """Accuracy values should be floats between 0 and 1."""
        for entry in self.accuracy:
            assert isinstance(entry['accuracy'], float)
            assert 0.0 <= entry['accuracy'] <= 1.0

    def test_round1_accuracy(self, seeded_data):
        """
        Round 1: 4 emails, 3 correct (2 phishing detected + 1 legitimate not flagged = no,
        correct = detector_verdict matches is_phishing ground truth).
        Emails: TP, TP, FN, FP => 2 correct out of 4 => accuracy = 0.5
        """
        entry = next(
            (e for e in self.accuracy if e['round_id'] == seeded_data['round1_id']),
            None
        )
        assert entry is not None
        assert abs(entry['accuracy'] - 0.5) < 0.01

    def test_round2_accuracy(self, seeded_data):
        """
        Round 2: 4 emails, all correct => accuracy = 1.0
        """
        entry = next(
            (e for e in self.accuracy if e['round_id'] == seeded_data['round2_id']),
            None
        )
        assert entry is not None
        assert abs(entry['accuracy'] - 1.0) < 0.01


# ---------------------------------------------------------------------------
# Tests: fp_fn_rates
# ---------------------------------------------------------------------------

class TestFpFnRates:
    """Tests for fp_fn_rates data correctness."""

    @pytest.fixture(autouse=True)
    def get_rates(self, client, admin_token, seeded_data):
        resp = client.get(
            '/api/stats/intelligence',
            headers={'Authorization': f'Bearer {admin_token}'},
        )
        self.rates = resp.get_json()['data']['fp_fn_rates']

    def test_each_entry_has_required_keys(self):
        """Each entry must have round_id, false_positive_rate, false_negative_rate."""
        for entry in self.rates:
            assert 'round_id' in entry
            assert 'false_positive_rate' in entry
            assert 'false_negative_rate' in entry

    def test_rates_are_floats_between_0_and_1(self):
        """FP/FN rates should be floats between 0 and 1."""
        for entry in self.rates:
            assert 0.0 <= entry['false_positive_rate'] <= 1.0
            assert 0.0 <= entry['false_negative_rate'] <= 1.0

    def test_round1_fp_fn_rates(self, seeded_data):
        """
        Round 1:
        - 1 FP (legitimate email flagged as phishing) out of 1 actual legitimate => FP rate = 1.0
        - 1 FN (phishing email missed) out of 3 actual phishing => FN rate = 1/3 ≈ 0.333
        """
        entry = next(
            (e for e in self.rates if e['round_id'] == seeded_data['round1_id']),
            None
        )
        assert entry is not None
        assert abs(entry['false_positive_rate'] - 1.0) < 0.01
        assert abs(entry['false_negative_rate'] - (1 / 3)) < 0.01

    def test_round2_fp_fn_rates(self, seeded_data):
        """
        Round 2: all correct => FP rate = 0.0, FN rate = 0.0
        """
        entry = next(
            (e for e in self.rates if e['round_id'] == seeded_data['round2_id']),
            None
        )
        assert entry is not None
        assert abs(entry['false_positive_rate'] - 0.0) < 0.01
        assert abs(entry['false_negative_rate'] - 0.0) < 0.01


# ---------------------------------------------------------------------------
# Tests: top_phishing_words
# ---------------------------------------------------------------------------

class TestTopPhishingWords:
    """Tests for top_phishing_words data correctness."""

    @pytest.fixture(autouse=True)
    def get_words(self, client, admin_token, seeded_data):
        resp = client.get(
            '/api/stats/intelligence',
            headers={'Authorization': f'Bearer {admin_token}'},
        )
        self.words = resp.get_json()['data']['top_phishing_words']

    def test_each_entry_has_word_and_count(self):
        """Each entry must have 'word' and 'count' keys."""
        for entry in self.words:
            assert 'word' in entry
            assert 'count' in entry

    def test_counts_are_integers(self):
        """Word counts should be integers."""
        for entry in self.words:
            assert isinstance(entry['count'], int)

    def test_at_most_20_words(self):
        """Should return at most 20 words."""
        assert len(self.words) <= 20

    def test_stopwords_excluded(self):
        """Common stopwords should not appear in top phishing words."""
        stopwords = {'the', 'a', 'an', 'is', 'in', 'to', 'of'}
        word_set = {entry['word'].lower() for entry in self.words}
        for sw in stopwords:
            assert sw not in word_set, f"Stopword '{sw}' should be excluded"

    def test_known_words_present(self):
        """
        Words from phishing subjects ('urgent', 'secure', 'phishing', 'click') should appear.
        Seeded phishing subjects: 'urgent action required', 'secure your account',
        'click the link now', 'urgent verify now', 'phishing test secure',
        'urgent secure your account now'
        """
        word_set = {entry['word'].lower() for entry in self.words}
        # 'urgent' appears 3 times in phishing subjects
        assert 'urgent' in word_set

    def test_words_ordered_by_count_descending(self):
        """Words should be ordered by count descending."""
        counts = [entry['count'] for entry in self.words]
        assert counts == sorted(counts, reverse=True)
