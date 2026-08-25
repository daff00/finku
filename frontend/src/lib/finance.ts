export function getCategoryTotals(
  transactions: Transaction[],
  totalExpense: number
): SpendingCategory[] {
  const totals: Record<string, number> = {};

  transactions
    .filter((txn) => txn.type === "EXPENSE")
    .forEach((txn) => {
      const category = txn.category || "Other";

      totals[category] =
        (totals[category] || 0) + Number(txn.amount);
    });

  return Object.entries(totals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage:
        totalExpense > 0
          ? Math.round((amount / totalExpense) * 100)
          : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
}