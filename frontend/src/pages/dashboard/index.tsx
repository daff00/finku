// frontend/src/pages/DashboardPage.tsx
import { useAccounts, useNetworth, useTransactions, useMonthly, useAmountVisibility } from "@/hooks";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";
import type { MonthlySummary, SpendingCategory } from "@/types";

import GreetingSection from "@/components/dashboard/GreetingSection";
import NetWorthCard from "@/components/dashboard/NetWorthCard";
import AccountGrid from "@/components/dashboard/AccountGrid";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import CashflowSummary from "@/components/analytics/CashflowSummary";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import WabiSabiFooter from "@/components/WabiSabiFooter";
import { usePageTitle } from "@/hooks/usePageTitle";

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
  usePageTitle("Dashboard");
  const { user } = useAuth();

  // ── Amount visibility hook ──
  const {
    globalVisible,
    toggleGlobal,
    getSectionVisible,
    toggleSection,
  } = useAmountVisibility();

  // ── Data fetching ──
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: networth, isLoading: networthLoading } = useNetworth();
  const { data: transactions, isLoading: transactionsLoading } = useTransactions({ limit: 50 });
  const { data: allMonthlyData, isLoading: monthlyLoading } = useMonthly();

  const isLoading =
    accountsLoading || networthLoading || transactionsLoading || monthlyLoading;

  if (isLoading) return <DashboardSkeleton />;

  // ── Derived data ──
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

  // ── Visibility states per section ──
  const showNetWorth = getSectionVisible("netWorth");
  const showAccounts = getSectionVisible("accounts");
  const showCashflow = getSectionVisible("cashflow");

  const recentTransactions = transactionList.slice(0, 5);
  const currentMonthLabel = getCurrentMonth();

  return (
    <div className="space-y-8 pb-12">
      {/* ── Header: Greeting + Global Eye Toggle ── */}
      <div className="flex items-center justify-between">
        <GreetingSection user={user ?? null} />
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

      {/* ── Main 2‑column area ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-8">
          {/* Net Worth */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[14px] uppercase tracking-[0.12em] text-[#8B7355] font-sans font-bold">
                NET WORTH
              </p>
              <button
                onClick={() => toggleSection("netWorth")}
                className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-[4px] hover:bg-border/30"
                aria-label={showNetWorth ? "Hide net worth" : "Show net worth"}
              >
                {showNetWorth ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <NetWorthCard
              totalNetworth={totalNetworth}
              accountCount={accountList.length}
              netChange={netChange}
              showAmount={showNetWorth}
            />
          </div>

          <div className="border-t-[0.5px] border-border" />

          {/* Accounts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#8B7355] font-sans">
                ACCOUNTS ({accountList.length})
              </p>
              <button
                onClick={() => toggleSection("accounts")}
                className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-[4px] hover:bg-border/30"
                aria-label={showAccounts ? "Hide account balances" : "Show account balances"}
              >
                {showAccounts ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <AccountGrid
              accounts={accountList}
              balanceMap={balanceMap}
              showAmount={showAccounts}
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 bg-surface border-[0.5px] border-border rounded-[4px] p-5 lg:p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#8B7355] font-sans">
                CASHFLOW SUMMARY
              </p>
              <button
                onClick={() => toggleSection("cashflow")}
                className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-[4px] hover:bg-border/30"
                aria-label={showCashflow ? "Hide cashflow amounts" : "Show cashflow amounts"}
              >
                {showCashflow ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <CashflowSummary
              month={currentMonthLabel}
              income={totalIncome}
              expense={totalExpense}
              savingRate={savingRate}
              categories={categoryData}
              showAmount={showCashflow}
            />
          </div>
        </div>
      </div>

      {/* ── Full‑width recent transactions (always visible) ── */}
      <RecentTransactions transactions={recentTransactions} />

      <WabiSabiFooter />
    </div>
  );
}