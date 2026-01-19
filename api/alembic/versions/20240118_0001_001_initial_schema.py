"""Initial schema with sessions and users tables

Revision ID: 001
Revises:
Create Date: 2024-01-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create session_status enum type
    session_status = postgresql.ENUM(
        'pending', 'processing', 'completed', 'failed',
        name='sessionstatus',
        create_type=False
    )
    session_status.create(op.get_bind(), checkfirst=True)

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('display_name', sa.String(100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('last_login_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_id', 'users', ['id'], unique=False)
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # Create sessions table
    op.create_table(
        'sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('audio_key', sa.String(512), nullable=False, comment='Storage key for audio file'),
        sa.Column('audio_url', sa.String(1024), nullable=True, comment='URL to access audio file'),
        sa.Column('duration_sec', sa.Float(), nullable=True, comment='Audio duration in seconds'),
        sa.Column('content_type', sa.String(100), nullable=True, server_default='audio/wav', comment='MIME type of audio file'),
        sa.Column('status', sa.Enum('pending', 'processing', 'completed', 'failed', name='sessionstatus'), nullable=False, server_default='pending'),
        sa.Column('error_message', sa.Text(), nullable=True, comment='Error message if processing failed'),
        sa.Column('score_contract', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='Full score contract JSON'),
        sa.Column('coaching_response', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='Full coaching response JSON'),
        sa.Column('transcript', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='Word-level transcript with timestamps'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('completed_at', sa.DateTime(), nullable=True, comment='When analysis completed'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_sessions_id', 'sessions', ['id'], unique=False)
    op.create_index('ix_sessions_user_id', 'sessions', ['user_id'], unique=False)
    op.create_index('ix_sessions_status', 'sessions', ['status'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_sessions_status', table_name='sessions')
    op.drop_index('ix_sessions_user_id', table_name='sessions')
    op.drop_index('ix_sessions_id', table_name='sessions')
    op.drop_table('sessions')

    op.drop_index('ix_users_email', table_name='users')
    op.drop_index('ix_users_id', table_name='users')
    op.drop_table('users')

    # Drop enum type
    sa.Enum(name='sessionstatus').drop(op.get_bind(), checkfirst=True)
