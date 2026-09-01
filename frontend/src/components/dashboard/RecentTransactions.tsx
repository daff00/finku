// frontend/src/components/RecentTransactions.tsx
import { NavLink } from "react-router-dom";
import type { Transaction } from "@/types";
import { formatDateShort, toTitleCase } from "@/lib/formatters";
import { useCurrency } from "@/contexts/CurrencyContext";

type Props = {
  transactions: Transaction[];
};

export default function RecentTransactions({ transactions }: Props) {
  return (
    <section className="w-full bg-surface border-[0.5px] border-border rounded-[4px] p-5 lg:p-6">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.12em] text-text-secondary font-sans">
          Latest Transactions
        </p>

        <NavLink
          to="/transactions"
          className="text-[11px] text-accent font-sans hover:underline"
        >
          See all →
        </NavLink>
      </div>

      <div className="mt-2 divide-y divide-border/60">
        {transactions.length === 0 ? (
          <div className="py-6 text-[12px] text-text-muted font-sans">
            No transactions yet.
          </div>
        ) : (
          transactions.map((txn) => (
            <TransactionRow key={txn.id} transaction={txn} />
          ))
        )}
      </div>
    </section>
  );
}

function TransactionRow({
  transaction: txn,
}: {
  transaction: Transaction;
}) {
  const { formatAmount } = useCurrency();
  const category = toTitleCase(txn.category || "Other");

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-[13px] text-text-primary font-sans truncate">
          {txn.note || category || "Untitled"}
        </p>

        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text-muted font-sans">
          <span>{formatDateShort(txn.date)}</span>

          <span className="w-1 h-1 rounded-full bg-border" />

          <span>{category}</span>

          {txn.source === "PDF" && (
            <span className="text-[8px] bg-border/30 px-1.5 py-0.5 rounded text-text-secondary">
              PDF
            </span>
          )}
        </div>
      </div>

      <span
        className={`font-mono text-[13px] flex-shrink-0 ${
          txn.type === "INCOME"
            ? "text-income"
            : txn.type === "EXPENSE"
              ? "text-expense"
              : "text-text-secondary"
        }`}
      >
        {txn.type === "EXPENSE"
          ? "-"
          : txn.type === "INCOME"
            ? "+"
            : ""}
        {formatAmount(Number(txn.amount))}
      </span>
    </div>
  );
}