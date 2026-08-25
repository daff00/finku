import { formatIDR } from "@/lib/formatters";
import SpendingByCategory from "./SpendingByCategory";
import type { SpendingCategory } from "./SpendingByCategory";

type Props = {
  month: string;
  income: number;
  expenses: number;
  categories: SpendingCategory[];
};

export default function CashflowSummary({
  month,
  income,
  expenses,
  categories,
}: Props) {
  return (
    <section className="bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px] p-5 lg:p-6 space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#8B7355] font-sans">
          Cashflow Summary
        </p>

        <p className="text-[9px] uppercase tracking-wider text-[#C4B5A0] font-sans mt-1">
          {month}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <CashflowMetric
            label="Income"
            value={formatIDR(income)}
            prefix="+"
            valueClassName="text-[#27AE60]"
          />

          <CashflowMetric
            label="Expenses"
            value={formatIDR(expenses)}
            prefix="−"
            valueClassName="text-[#C0392B]"
          />
        </div>
      </div>

      <Divider />

      <section>
        <p className="text-[11px] font-medium text-[#8B7355] font-sans">
          Spending by Category
        </p>

        <div className="mt-3">
          <SpendingByCategory
            data={categories}
            emptyMessage="No expenses yet."
          />
        </div>
      </section>
    </section>
  );
}

function CashflowMetric({
  label,
  value,
  prefix,
  valueClassName,
}: {
  label: string;
  value: string;
  prefix: string;
  valueClassName: string;
}) {
  return (
    <div className="rounded-[4px] border-[0.5px] border-[#E8E4DE] bg-[#FAFAF8] p-3">
      <div className="text-[9px] uppercase tracking-[0.12em] text-[#8B7355] font-sans">
        {label}
      </div>

      <div className={`font-mono text-[13px] font-medium mt-0.5 ${valueClassName}`}>
        <span className="whitespace-nowrap">
          {prefix}
          {value}
        </span>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="border-t-[0.5px] border-[#E8E4DE]" />;
}