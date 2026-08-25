import { useAccounts, useNetworth, useTransactions, useMonthly } from "@/hooks";
import { useAuth } from "@/hooks/useAuth";

import { formatIDR } from "@/lib/formatters";

import type { MonthlySummary, SpendingCategory } from "@/types";

import CashflowSummary from "@/components/CashflowSummary";
import AccountCard from "@/components/dashboard/AccountCard";
import RecentTransactions from "@/components/RecentTransactions";
import WabiSabiFooter from "@/components/WabiSabiFooter";

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "おはよう";
  }

  if (hour >= 12 && hour < 17) {
    return "こんにちは";
  }

  if (hour >= 17 && hour < 21) {
    return "こんばんは";
  }

  return "おやすみ";
}

function getCurrentMonth(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function getCurrentMonthStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: accounts, isLoading: accountsLoading } = useAccounts();

  const { data: networth, isLoading: networthLoading } = useNetworth();

  const { data: transactions, isLoading: transactionsLoading } =
    useTransactions({
      limit: 50,
    });

  const { data: allMonthlyData, isLoading: monthlyLoading } = useMonthly();

  const isLoading =
    accountsLoading || networthLoading || transactionsLoading || monthlyLoading;

  const displayName = user?.display_name || user?.username || "Guest";

  const greeting = getGreeting();
  const currentMonthLabel = getCurrentMonth();
  const currentMonthStr = getCurrentMonthStr();

  /*
   * ─────────────────────────────────────────────
   * Loading
   * ─────────────────────────────────────────────
   */

  if (isLoading) {
    return (
      <div className="space-y-8 pb-12 animate-pulse">
        <div className="space-y-2">
          <div className="h-5 w-40 bg-border/50 rounded" />
          <div className="h-4 w-52 bg-border/40 rounded" />
        </div>

        <div className="space-y-8">
          <div className="h-32 bg-border/40 rounded-[4px]" />

          <div className="h-px bg-border/40" />

          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 bg-border/40 rounded-[4px]" />
            <div className="h-24 bg-border/40 rounded-[4px]" />
            <div className="h-24 bg-border/40 rounded-[4px]" />
            <div className="h-24 bg-border/40 rounded-[4px]" />
          </div>

          <div className="h-px bg-border/40" />

          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-12 bg-border/40 rounded" />
          ))}

          <div className="h-[420px] bg-border/40 rounded-[4px]" />
        </div>
      </div>
    );
  }

  /*
   * ─────────────────────────────────────────────
   * Data
   * ─────────────────────────────────────────────
   */

  const accountList = accounts ?? [];
  const transactionList = transactions ?? [];

  const totalNetworth = networth?.total ?? "0";

  const balanceMap: Record<number, string> = {};

  networth?.per_account?.forEach((account: any) => {
    balanceMap[account.account_id] = account.balance;
  });

  const recentTransactions = transactionList.slice(0, 5);

  const currentMonthData = allMonthlyData?.find(
    (item: MonthlySummary) => item.month.slice(0, 7) === currentMonthStr,
  );

  const totalIncome = Number(currentMonthData?.income ?? 0);
  const totalExpense = Number(currentMonthData?.expenses ?? 0);
  const netChange = Number(currentMonthData?.savings ?? 0);

  /*
   * ── Category breakdown ──
   */

  const categoryTotals: Record<string, number> = {};

  transactionList
    .filter((txn) => txn.type === "EXPENSE")
    .forEach((txn) => {
      const category = txn.category || "Other";

      categoryTotals[category] =
        (categoryTotals[category] || 0) + Number(txn.amount);
    });

  const categoryData: SpendingCategory[] = Object.entries(
      categoryTotals,
    ).map(([category, amount]) => ({
      category,
      total: amount,
      percentage:
        totalExpense > 0
          ? Math.round((amount / totalExpense) * 100)
          : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  /*
   * ─────────────────────────────────────────────
   * Render
   * ─────────────────────────────────────────────
   */

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title */}

      <div>
        <h1 className="font-playfair text-[24px] text-[#1C1410]">Dashboard</h1>

        <p className="font-inter text-[12px] text-[#8B7355] mt-1">
          Track your current networth
        </p>
      </div>
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p
            className="
          font-sans
          text-[15px]
          sm:text-[16px]
          font-medium
          text-[#6F5A43]
        "
          >
            {greeting}, {displayName}
          </p>

          <p
            className="
          font-sans
          text-[12px]
          sm:text-[13px]
          font-medium
          text-[#8B7355]
          mt-1
        "
          >
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Main 2-column area */}
      <div
        className="
      grid
      grid-cols-1
      lg:grid-cols-12
      gap-8
      items-start
    "
      >
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 space-y-8">
          {/* Net Worth */}
          <section>
            <div className="mb-2">
              <p
                className="
              text-[14px]
              uppercase
              tracking-[0.12em]
              text-[#8B7355]
              font-sans
              font-bold
            "
              >
                NET WORTH
              </p>
            </div>

            <div
              className="
            bg-white
            border-[0.5px]
            border-[#E8E4DE]
            border-l-[3px]
            border-l-[#8B7355]
            rounded-[4px]
            p-5
          "
            >
              <p
                className="
              font-mono
              text-3xl
              sm:text-4xl
              text-[#1C1410]
              tracking-tight
            "
              >
                {formatIDR(totalNetworth)}
              </p>

              <p
                className="
              font-sans
              text-[11px]
              text-[#8B7355]
              mt-1
            "
              >
                Total across {accountList.length} accounts
              </p>

              {netChange !== 0 && (
                <p
                  className={`
                  font-mono
                  text-[11px]
                  mt-3
                  ${netChange >= 0 ? "text-[#27AE60]" : "text-[#C0392B]"}
                `}
                >
                  {netChange >= 0 ? "+" : ""}
                  {formatIDR(netChange)}

                  <span
                    className="
                  font-sans
                  text-[#8B7355]
                  ml-1
                "
                  >
                    this month
                  </span>
                </p>
              )}
            </div>
          </section>

          <div
            className="
          border-t-[0.5px]
          border-[#E8E4DE]
        "
          />

          {/* Accounts */}
          <section>
            <div className="flex items-center justify-between">
              <p
                className="
              text-[10px]
              uppercase
              tracking-[0.12em]
              text-[#8B7355]
              font-sans
            "
              >
                ACCOUNTS ({accountList.length})
              </p>

              <span
                className="
              text-[10px]
              text-[#8B7355]
              font-sans
            "
              >
                {accountList.length} total
              </span>
            </div>

            <div
              className="
            hidden
            sm:grid
            grid-cols-2
            gap-3
            mt-3
          "
            >
              {accountList.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  balance={balanceMap[account.id] ?? "0"}
                />
              ))}
            </div>

            <div
              className="
            sm:hidden
            flex
            gap-3
            overflow-x-auto
            no-scrollbar
            pb-1
            -mx-4
            px-4
            mt-3
          "
            >
              {accountList.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  balance={balanceMap[account.id] ?? "0"}
                />
              ))}
            </div>

            {accountList.length === 0 && (
              <div
                className="
              mt-3
              text-[12px]
              text-[#8B7355]
              font-sans
            "
              >
                No accounts yet.
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN — ENTIRE CASHFLOW SUMMARY */}
        <div
          className="
        lg:col-span-5
        bg-white
        border-[0.5px]
        border-[#E8E4DE]
        rounded-[4px]
        p-5
        lg:p-6
        space-y-6
      "
        >
          {/* Cashflow Summary */}
          <CashflowSummary
            month={currentMonthLabel}
            income={totalIncome}
            expenses={totalExpense}
            categories={categoryData}
          />
        </div>
      </div>

      {/* FULL-WIDTH LATEST TRANSACTIONS */}
      <RecentTransactions transactions={recentTransactions} />
      {/* Wabi-Sabi */}
      <WabiSabiFooter />
    </div>
  );
}
