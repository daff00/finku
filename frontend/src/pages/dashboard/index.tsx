// frontend/src/pages/DashboardPage.tsx
import { useAccounts, useNetworth, useTransactions, useMonthly } from "@/hooks";
import { useAuth } from "@/hooks/useAuth";
import type { MonthlySummary, SpendingCategory } from "@/types";

import GreetingSection from "@/components/dashboard/GreetingSection";
import NetWorthCard from "@/components/dashboard/NetWorthCard";
import AccountGrid from "@/components/dashboard/AccountGrid";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import CashflowSummary from "@/components/analytics/CashflowSummary";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import WabiSabiFooter from "@/components/WabiSabiFooter";
import { usePageTitle } from '@/hooks/usePageTitle'

function getCurrentMonth(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function getCurrentMonthStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function DashboardPage() {
  usePageTitle('Dashboard')
  const { user } = useAuth();

  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: networth, isLoading: networthLoading } = useNetworth();
  const { data: transactions, isLoading: transactionsLoading } = useTransactions({ limit: 50 });
  const { data: allMonthlyData, isLoading: monthlyLoading } = useMonthly();

  const isLoading = accountsLoading || networthLoading || transactionsLoading || monthlyLoading;

  if (isLoading) return <DashboardSkeleton />;

  const accountList = accounts ?? [];
  const transactionList = transactions ?? [];
  const totalNetworth = networth?.total ?? "0";

  const balanceMap: Record<number, string> = {};
  networth?.per_account?.forEach((acc: any) => {
    balanceMap[acc.account_id] = acc.balance;
  });

  const currentMonthStr = getCurrentMonthStr();
  const currentMonthData = allMonthlyData?.find(
    (item: MonthlySummary) => item.month.slice(0, 7) === currentMonthStr
  );

  const totalIncome = Number(currentMonthData?.income ?? 0);
  const totalExpense = Number(currentMonthData?.expenses ?? 0);
  const netChange = Number(currentMonthData?.savings ?? 0);
  const savingRate = totalIncome > 0
    ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
    : 0;

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  transactionList
    .filter((txn) => txn.type === "EXPENSE")
    .forEach((txn) => {
      const category = txn.category || "Other";
      categoryTotals[category] = (categoryTotals[category] || 0) + Number(txn.amount);
    });

  const categoryData: SpendingCategory[] = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      total: amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const recentTransactions = transactionList.slice(0, 5);
  const currentMonthLabel = getCurrentMonth();

  return (
    <div className="space-y-8 pb-12">
      {/* Greeting */}
      <GreetingSection user={user ?? null} />

      {/* Main 2-column area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-8">
          <NetWorthCard
            totalNetworth={totalNetworth}
            accountCount={accountList.length}
            netChange={netChange}
          />

          <div className="border-t-[0.5px] border-border" />

          <AccountGrid accounts={accountList} balanceMap={balanceMap} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 bg-surface border-[0.5px] border-border rounded-[4px] p-5 lg:p-6 space-y-6">
          <CashflowSummary
            month={currentMonthLabel}
            income={totalIncome}
            expense={totalExpense}
            savingRate={savingRate}
            categories={categoryData}
          />
        </div>
      </div>

      {/* Full-width recent transactions */}
      <RecentTransactions transactions={recentTransactions} />

      <WabiSabiFooter />
    </div>
  );
}