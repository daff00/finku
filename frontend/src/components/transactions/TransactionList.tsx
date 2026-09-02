// frontend/src/components/transactions/TransactionList.tsx
import { formatDate } from "@/lib/formatters";
import type { Transaction } from "@/types";
import TransactionRow from "./TransactionRow";

type AccountInfo = {
  name: string;
  bank: string;
  color: string;
};

interface TransactionListProps {
  grouped: { date: string; transactions: Transaction[] }[];
  accountMap: Record<number, AccountInfo>;
}

export default function TransactionList({ grouped, accountMap }: TransactionListProps) {
  return (
    <div className="space-y-6">
      {grouped.map(({ date, transactions }) => (
        <div key={date}>
          <div className="mb-1 font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
            {formatDate(date)}
          </div>
          <div>
            {transactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                account={accountMap[tx.account_id]}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}