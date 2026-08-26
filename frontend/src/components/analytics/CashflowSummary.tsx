// frontend/src/components/analytics/CashflowSummary.tsx
import CashflowStat from "@/components/dashboard/CashflowStat";
import SpendingByCategory from "@/components/analytics/SpendingByCategory";
import { formatIDR } from "@/lib/formatters";
import type { SpendingCategory } from "@/types";

interface CashflowSummaryProps {
  month?: string;
  income: number;
  expense: number;
  savingRate: number;
  categories?: SpendingCategory[];
}

export default function CashflowSummary({
  month,
  income,
  expense,
  savingRate,
  categories = [],
}: CashflowSummaryProps) {
  return (
    <section className="space-y-4">
      {/* Month label */}
      {month && (
        <p className="text-[9px] uppercase tracking-wider text-text-muted font-sans">
          {month}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <CashflowStat label="Income" value={formatIDR(income)} color="#27AE60" />
        <CashflowStat label="Expense" value={formatIDR(expense)} color="#C0392B" />
        <CashflowStat label="Saving Rate" value={`${savingRate}%`} color="#1C1410" />
      </div>

      {/* Spending by Category */}
      {categories && categories.length > 0 && (
        <>
          <div className="border-t-[0.5px] border-dashed border-border pt-4" />
          <div>
            <p className="font-sans text-[11px] font-medium text-text-secondary mb-3">
              Spending by Category
            </p>
            <SpendingByCategory data={categories} emptyMessage="No expenses yet." />
          </div>
        </>
      )}
    </section>
  );
}