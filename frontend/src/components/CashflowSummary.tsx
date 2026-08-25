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

        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3"
        >
          <CashflowMetric
            label="Income"
            value={`+${formatIDR(income)}`}
            valueClassName="text-[#27AE60]"
          />

          <CashflowMetric
            label="Expenses"
            value={`-${formatIDR(expenses)}`}
            valueClassName="text-[#C0392B]"
          />
        </div>
      </div>

      <Divider />

      <section>
        <p className="text-[12px] font-medium text-[#8B7355] font-sans">
          Spending by Category
        </p>

        <div className="mt-4">
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
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName: string;
}) {
  return (
    <div className="p-3 bg-[#FAFAF8] rounded-[4px] border-[0.5px] border-[#E8E4DE]">
      <p className="text-[9px] uppercase tracking-wider text-[#8B7355] font-sans">
        {label}
      </p>

      <p className={`font-mono text-[14px] mt-1 ${valueClassName}`}>{value}</p>
    </div>
  );
}

function Divider() {
  return <div className="border-t-[0.5px] border-[#E8E4DE]" />;
}
