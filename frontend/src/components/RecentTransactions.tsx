import { NavLink } from "react-router-dom";
import type { Transaction } from "@/types";
import { formatDateShort, formatIDR, toTitleCase } from "@/lib/formatters";

type Props = {
  transactions: Transaction[];
};

export default function RecentTransactions({ transactions }: Props) {
  return (
    <section className="w-full bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px] p-5 lg:p-6">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#8B7355] font-sans">
          Latest Transactions
        </p>

        <NavLink
          to="/transactions"
          className="text-[11px] text-[#C0392B] font-sans hover:underline"
        >
          See all →
        </NavLink>
      </div>

      <div className="mt-2 divide-y divide-[#E8E4DE]/60">
        {transactions.length === 0 ? (
          <div className="py-6 text-[12px] text-[#C4B5A0] font-sans">
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
  const category = toTitleCase(txn.category || "Other");

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-[13px] text-[#1C1410] font-serif truncate">
          {txn.note || category || "Untitled"}
        </p>

        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#C4B5A0] font-sans">
          <span>{formatDateShort(txn.date)}</span>

          <span className="w-1 h-1 rounded-full bg-[#E8E4DE]" />

          <span>{category}</span>

          {txn.source === "PDF" && (
            <span className="text-[8px] bg-[#F3F0EB] px-1.5 py-0.5 rounded text-[#8B7355]">
              PDF
            </span>
          )}
        </div>
      </div>

      <span
        className={`font-mono text-[13px] flex-shrink-0 ${
          txn.type === "INCOME"
            ? "text-[#27AE60]"
            : txn.type === "EXPENSE"
              ? "text-[#C0392B]"
              : "text-[#8B7355]"
        }`}
      >
        {txn.type === "EXPENSE"
          ? "-"
          : txn.type === "INCOME"
            ? "+"
            : ""}
        {formatIDR(txn.amount)}
      </span>
    </div>
  );
}