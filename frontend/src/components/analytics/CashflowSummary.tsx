// frontend/src/components/analytics/CashflowSummary.tsx
import CashflowStat from "@/components/dashboard/CashflowStat";
import SpendingByCategory from "@/components/analytics/SpendingByCategory";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { SpendingCategory } from "@/types";

interface CashflowSummaryProps {
  month?: string;
  income: number;
  expense: number;
  savingRate: number;
  categories?: SpendingCategory[];
  showAmount: boolean;
}

export default function CashflowSummary({
  month,
  income,
  expense,
  savingRate,
  categories = [],
  showAmount,
}: CashflowSummaryProps) {
  const { formatAmount } = useCurrency();

  return (
    <section className="space-y-4">
      {month && (
        <p className="text-[9px] uppercase tracking-wider text-text-muted font-sans">
          {month}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <CashflowStat
          label="Income"
          value={showAmount ? formatAmount(income) : "•••••••••"}
          color="var(--color-income)"
        />
        <CashflowStat
          label="Expense"
          value={showAmount ? formatAmount(expense) : "•••••••••"}
          color="var(--color-expense)"
        />
        <CashflowStat
          label="Saving Rate"
          value={showAmount ? `${savingRate}%` : "••%"}
          color="var(--color-text-primary)"
        />
      </div>

      {categories && categories.length > 0 && (
        <>
          <div className="border-t-[0.5px] border-dashed border-border pt-4" />
          <div>
            <p className="font-sans text-[11px] font-medium text-text-secondary mb-3">
              Spending by Category
            </p>
            <SpendingByCategory
              data={categories}
              emptyMessage="No expenses yet."
              showAmount={showAmount}
            />
          </div>
        </>
      )}
    </section>
  );
}