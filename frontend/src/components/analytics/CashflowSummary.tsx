// frontend/src/components/analytics/CashflowSummary.tsx
import CashflowStat from "@/components/CashflowStat";
import { formatIDR } from "@/lib";

interface CashflowSummaryProps {
  income: number;
  expense: number;
  savingRate: number;
}

export default function CashflowSummary({ income, expense, savingRate }: CashflowSummaryProps) {
  return (
    <section>
      <h2 className="font-sans text-[11px] font-medium tracking-wide text-[#8B7355] mb-2">
        Cashflow Summary
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <CashflowStat label="Income" value={formatIDR(income)} color="#27AE60" />
        <CashflowStat label="Expense" value={formatIDR(expense)} color="#C0392B" />
        <CashflowStat label="Saving Rate" value={`${savingRate}%`} color="#1C1410" />
      </div>
    </section>
  );
}