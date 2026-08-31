// frontend/src/pages/AnalyticsPage.tsx
import { useMemo, useState } from "react";
import { useNetworth, useMonthly, useCategories, useSpendingByAccount, useAmountVisibility } from "@/hooks";
import { Eye, EyeOff } from "lucide-react";
import { BANK_LABELS, BANK_COLORS } from "@/lib/constants";
import type { MonthlySummary } from "@/types";

import WabiSabiFooter from "@/components/WabiSabiFooter";
import MonthSelector from "@/components/analytics/MonthSelector";
import NetWorthTrend from "@/components/analytics/NetWorthTrend";
import CashflowSummary from "@/components/analytics/CashflowSummary";
import SpendingByCategory from "@/components/analytics/SpendingByCategory";
import SpendingByAccount from "@/components/analytics/SpendingByAccount";
import AnalyticsSkeleton from "@/components/analytics/AnalyticsSkeleton";
import QuickInsights from "@/components/analytics/QuickInsights";
import { usePageTitle } from "@/hooks/usePageTitle";

type AccountSpendingItem = {
  accountId: number;
  accountName: string;
  bankLabel: string;
  color: string;
  total: number;
  percentage: number;
};

export default function AnalyticsPage() {
  usePageTitle("Analytics");

  // ── Amount visibility ──
  const { globalVisible, toggleGlobal } = useAmountVisibility();

  // ── State ────────────────────────────────────────────────────
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  // ── Data ─────────────────────────────────────────────────────
  const { data: networth, isLoading: networthLoading } = useNetworth();
  const { data: allMonthlyData, isLoading: monthlyLoading } = useMonthly();
  const { data: categoryData, isLoading: categoryLoading } = useCategories(selectedMonth);
  const { data: spendingByAccount, isLoading: spendingLoading } = useSpendingByAccount(selectedMonth);

  const isLoading = networthLoading || monthlyLoading || categoryLoading || spendingLoading;

  // ── Derived data ─────────────────────────────────────────────
  const selectedMonthData = useMemo(
    () =>
      allMonthlyData?.find(
        (item: MonthlySummary) => item.month.slice(0, 7) === selectedMonth
      ) ?? null,
    [allMonthlyData, selectedMonth]
  );

  const chartData = useMemo(() => {
    if (!allMonthlyData) return [];

    const selectedDate = new Date(
      Number(selectedMonth.slice(0, 4)),
      Number(selectedMonth.slice(5, 7)) - 1,
      1
    );

    const startDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() - 11,
      1
    );

    return allMonthlyData
      .map((item: MonthlySummary) => ({
        month: item.month.slice(0, 7),
        income: Number(item.income ?? 0),
        expense: Number(item.expenses ?? 0),
        savings: Number(item.savings ?? 0),
      }))
      .filter((item) => {
        const itemDate = new Date(
          Number(item.month.slice(0, 4)),
          Number(item.month.slice(5, 7)) - 1,
          1
        );
        return itemDate >= startDate && itemDate <= selectedDate;
      })
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [allMonthlyData, selectedMonth]);

  const accountSpending = useMemo<AccountSpendingItem[]>(() => {
    if (!spendingByAccount?.length) return [];

    const mapped = spendingByAccount.map((item) => {
      const bankKey = item.bank as keyof typeof BANK_COLORS;
      return {
        accountId: item.account_id,
        accountName: item.name,
        bankLabel: BANK_LABELS[bankKey] || item.bank,
        color: BANK_COLORS[bankKey] || "#8B7355",
        total: Number(item.balance ?? 0),
      };
    });

    const totalSpending = mapped.reduce((sum, item) => sum + item.total, 0);
    if (totalSpending === 0) return [];

    return mapped.map((item) => ({
      ...item,
      percentage: (item.total / totalSpending) * 100,
    }));
  }, [spendingByAccount]);

  const totalIncome = Number(selectedMonthData?.income ?? 0);
  const totalExpense = Number(selectedMonthData?.expenses ?? 0);
  const currentNetWorth = Number(networth?.total ?? 0);

  const savingRate =
    totalIncome > 0
      ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
      : 0;

  // ── Render ────────────────────────────────────────────────────
  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* ── Page Header with Global Toggle ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light tracking-tight text-[#1C1410]">Analytics</h1>
          <p className="mt-1 font-sans text-sm text-[#8B7355]">Insights into your financial health</p>
        </div>
        <button
          onClick={toggleGlobal}
          className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-[4px] hover:bg-border/30"
          aria-label={globalVisible ? "Hide all amounts" : "Show all amounts"}
        >
          {globalVisible ? (
            <Eye className="w-5 h-5" />
          ) : (
            <EyeOff className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Month Selector */}
      <MonthSelector
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      {/* Net Worth Trend */}
      <NetWorthTrend
        netWorth={currentNetWorth}
        chartData={chartData}
        showAmount={globalVisible}
      />

      <Divider />

      {/* Cashflow Summary */}
      <CashflowSummary
        income={totalIncome}
        expense={totalExpense}
        savingRate={savingRate}
        showAmount={globalVisible}
      />

      {/* Quick Insights */}
      <section>
        <QuickInsights
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          savingRate={savingRate}
          categoryData={categoryData ?? []}
          accountSpending={accountSpending ?? []}
          chartData={chartData}
          currentNetWorth={currentNetWorth}
          showAmount={globalVisible}
        />
      </section>

      <Divider />

      {/* Spending by Category */}
      <section>
        <h2 className="font-sans text-[11px] font-medium tracking-wide text-[#8B7355] mb-3">
          Spending by Category
        </h2>
        <SpendingByCategory
          data={categoryData ?? []}
          emptyMessage="No expenses yet."
          showAmount={globalVisible}
        />
      </section>

      <Divider />

      {/* Spending by Bank Account */}
      <section>
        <h2 className="font-sans text-[11px] font-medium tracking-wide text-[#8B7355] mb-3">
          Spending by Bank Account
        </h2>
        <SpendingByAccount
          data={accountSpending}
          showAmount={globalVisible}
        />
      </section>

      <WabiSabiFooter />
    </div>
  );
}

function Divider() {
  return <div className="border-t-[0.5px] border-dashed border-[#E8E4DE]" />;
}