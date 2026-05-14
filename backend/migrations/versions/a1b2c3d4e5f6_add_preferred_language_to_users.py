"""add preferred_language to users

Revision ID: a1b2c3d4e5f6
Revises: e6f7a8b9c0d1
Create Date: 2026-05-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'e6f7a8b9c0d1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'users',
        sa.Column('preferred_language', sa.String(8), nullable=False, server_default='en'),
    )


def downgrade() -> None:
    op.drop_column('users', 'preferred_language')
