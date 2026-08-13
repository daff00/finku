"""add users table and user_id to accounts transactions balances

Revision ID: 5020ec765648
Revises: bb8e24a76f0a
Create Date: 2026-08-12 09:21:40.534532

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5020ec765648'
down_revision: Union[str, Sequence[str], None] = 'bb8e24a76f0a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Create users table ────────────────────────────────────────
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('display_name', sa.String(length=100), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    # ── Add user_id to accounts (batch mode for SQLite FK support) ─
    with op.batch_alter_table('accounts') as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=False, server_default='1'))
        batch_op.create_foreign_key('fk_accounts_user_id', 'users', ['user_id'], ['id'])

    # ── Add user_id to balances ───────────────────────────────────
    with op.batch_alter_table('balances') as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=False, server_default='1'))
        batch_op.create_foreign_key('fk_balances_user_id', 'users', ['user_id'], ['id'])

    # ── Add user_id to transactions ───────────────────────────────
    with op.batch_alter_table('transactions') as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=False, server_default='1'))
        batch_op.create_foreign_key('fk_transactions_user_id', 'users', ['user_id'], ['id'])


def downgrade() -> None:
    with op.batch_alter_table('transactions') as batch_op:
        batch_op.drop_constraint('fk_transactions_user_id', type_='foreignkey')
        batch_op.drop_column('user_id')

    with op.batch_alter_table('balances') as batch_op:
        batch_op.drop_constraint('fk_balances_user_id', type_='foreignkey')
        batch_op.drop_column('user_id')

    with op.batch_alter_table('accounts') as batch_op:
        batch_op.drop_constraint('fk_accounts_user_id', type_='foreignkey')
        batch_op.drop_column('user_id')

    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')