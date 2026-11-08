"""add transfer direction and fee link

Revision ID: b0689d2c4b51
Revises: 554518d0e423
Create Date: 2026-09-04 15:02:00.713876

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b0689d2c4b51'
down_revision: Union[str, Sequence[str], None] = '554518d0e423'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    transfer_direction_enum = sa.Enum("OUT", "IN", name="transferdirectionenum")
    transfer_direction_enum.create(op.get_bind(), checkfirst=True)

    with op.batch_alter_table("transactions") as batch_op:
        batch_op.add_column(sa.Column("direction", transfer_direction_enum, nullable=True))

    with op.batch_alter_table("transfer_pairs") as batch_op:
        batch_op.add_column(sa.Column("fee_transaction_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            "fk_transfer_pairs_fee_transaction_id",
            "transactions",
            ["fee_transaction_id"],
            ["id"],
        )

    # ── Backfill direction for existing transfer transactions ──
    op.execute("""
        UPDATE transactions
        SET direction = 'OUT'
        WHERE id IN (SELECT from_transaction_id FROM transfer_pairs)
    """)
    op.execute("""
        UPDATE transactions
        SET direction = 'IN'
        WHERE id IN (SELECT to_transaction_id FROM transfer_pairs)
    """)


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("transfer_pairs") as batch_op:
        batch_op.drop_constraint("fk_transfer_pairs_fee_transaction_id", type_="foreignkey")
        batch_op.drop_column("fee_transaction_id")

    with op.batch_alter_table("transactions") as batch_op:
        batch_op.drop_column("direction")

    transfer_direction_enum = sa.Enum("OUT", "IN", name="transferdirectionenum")
    transfer_direction_enum.drop(op.get_bind(), checkfirst=True)