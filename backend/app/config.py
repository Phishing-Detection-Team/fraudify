"""
Application configuration for different environments.

Loads environment variables from .env file for safety and easy recall.
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
env_file = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
if os.path.exists(env_file):
    load_dotenv(env_file)
else:
    # Try backend/.env
    env_file_backend = os.path.join(os.path.dirname(__file__), '..', '.env')
    if os.path.exists(env_file_backend):
        load_dotenv(env_file_backend)


class Config:
    """Base configuration - loads all settings from environment variables."""
    
    # Flask Settings
    SECRET_KEY = os.environ.get(
        'SECRET_KEY',
        'dev-secret-key-change-in-production'
    )
    DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
    TESTING = False
    
    # SQLAlchemy
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = os.environ.get('SQLALCHEMY_ECHO', 'False').lower() == 'true'
    
    # Session
    PERMANENT_SESSION_LIFETIME = timedelta(
        days=int(os.environ.get('SESSION_LIFETIME_DAYS', 7))
    )
    SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'True').lower() == 'true'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = os.environ.get('SESSION_COOKIE_SAMESITE', 'Lax')
    
    # Application Settings
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16MB


class DevelopmentConfig(Config):
    """Development configuration."""
    
    DEBUG = True
    SQLALCHEMY_ECHO = True
    SESSION_COOKIE_SECURE = False
    
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DEV_DATABASE_URL',
        'sqlite:///app.db'
    )


class TestingConfig(Config):
    """Testing configuration."""
    
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False
    SERVER_NAME = os.environ.get('TEST_SERVER_NAME', 'localhost')


class ProductionConfig(Config):
    """Production configuration."""
    
    DEBUG = False
    SQLALCHEMY_ECHO = False
    SESSION_COOKIE_SECURE = True
    
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'PROD_DATABASE_URL',
        'postgresql://localhost/phishing_db'
    )
    
    # Ensure critical settings are set in production
    if not os.environ.get('SECRET_KEY') or os.environ.get('SECRET_KEY') == 'dev-secret-key-change-in-production':
        raise ValueError('SECRET_KEY must be set in .env for production')
    
    if not os.environ.get('PROD_DATABASE_URL'):
        raise ValueError('PROD_DATABASE_URL must be set in .env for production')


def get_config(env=None):
    """
    Get configuration based on environment.
    
    Args:
        env: Environment name ('development', 'testing', 'production')
             Defaults to FLASK_ENV from .env or 'development'
    
    Returns:
        Configuration class
    """
    if env is None:
        env = os.environ.get('FLASK_ENV', 'development')
    
    configs = {
        'development': DevelopmentConfig,
        'testing': TestingConfig,
        'production': ProductionConfig,
    }
    
    return configs.get(env, DevelopmentConfig)
