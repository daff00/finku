import type { SpendingCategory, Transaction } from "@/types";

export function getCategoryTotals(
  transactions: Transaction[],
): SpendingCategory[] {
  const totals: Record<string, number> = {};

  transactions
    .filter((txn) => txn.type === "EXPENSE")
    .forEach((txn) => {
      const category = txn.category || "Other";
      totals[category] = (totals[category] || 0) + Number(txn.amount);
    });

  const totalSpending = Object.values(totals).reduce(
    (sum, amount) => sum + amount,
    0,
  );

  return Object.entries(totals).map(([category, amount]) => ({
    category,
    total: amount,
    percentage:
      totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
  }));
}