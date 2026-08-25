// frontend/src/pages/AnalyticsPage.tsx
import { useMemo, useState } from "react";
import {
  useNetworth,
  useMonthly,
  useCategories,
  useSpendingByAccount,
} from "@/hooks";
import { formatIDR, toTitleCase } from "@/lib/formatters";
import { BANK_LABELS, BANK_COLORS } from "@/lib/constants";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import SpendingByCategory from "@/components/SpendingByCategory";
import WabiSabiFooter from "@/components/WabiSabiFooter";
import type { MonthlySummary, CategoryBreakdown } from "@/types";

// ── shadcn imports ─────────────────────────────────────────────
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// ── Colors ─────────────────────────────────────────────────────

const COLORS = {
  income: "#27AE60",
  expense: "#C0392B",
  accent: "#C0392B",
  text: "#1C1410",
  muted: "#8B7355",
  lightMuted: "#C4B5A0",
  border: "#E8E4DE",
  background: "#FFFFFF",
};

const CATEGORY_COLORS = [
  "#C0392B",
  "#E67E22",
  "#F1C40F",
  "#2ECC71",
  "#3498DB",
  "#9B59B6",
  "#1ABC9C",
  "#E74C3C",
  "#34495E",
  "#16A085",
];

// ── Helpers ────────────────────────────────────────────────────

function normalizeMonth(monthStr: string): string {
  return monthStr.slice(0, 7);
}

export default function AnalyticsPage() {
  // ── State ────────────────────────────────────────────────────

  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7),
  );

  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);

  const monthOptions = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

      months.push({
        // Used by the API/filter
        value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0",
        )}`,

        // Used only for display
        label: d.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      });
    }

    return months;
  }, []);

  // ── Data ─────────────────────────────────────────────────────

  const { data: networth, isLoading: networthLoading } = useNetworth();

  // Keep fetching all months so the trend chart remains independent
  // from the selected-month filter.
  const { data: allMonthlyData, isLoading: monthlyLoading } = useMonthly();

  // These remain filtered by the selected month.
  const { data: categoryData, isLoading: categoryLoading } =
    useCategories(selectedMonth);

  const { data: spendingByAccount, isLoading: spendingLoading } =
    useSpendingByAccount(selectedMonth);

  const isLoading =
    networthLoading || monthlyLoading || categoryLoading || spendingLoading;

  // ── Selected month data ──────────────────────────────────────

  const selectedMonthData = useMemo(() => {
    if (!allMonthlyData) return null;

    const normalized = allMonthlyData.map((item: MonthlySummary) => ({
      ...item,
      month: normalizeMonth(item.month),
    }));

    return (
      normalized.find((item: MonthlySummary) => item.month === selectedMonth) ||
      null
    );
  }, [allMonthlyData, selectedMonth]);

  // ── Chart data ───────────────────────────────────────────────

  const chartData = useMemo(() => {
    if (!allMonthlyData) return [];

    const selectedDate = new Date(
      Number(selectedMonth.slice(0, 4)),
      Number(selectedMonth.slice(5, 7)) - 1,
      1,
    );

    const startDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() - 11,
      1,
    );

    return allMonthlyData
      .map((item: MonthlySummary) => ({
        month: normalizeMonth(item.month),
        income: Number(item.income ?? 0),
        expense: Number(item.expenses ?? 0),
        savings: Number(item.savings ?? 0),
      }))
      .filter((item) => {
        const itemDate = new Date(
          Number(item.month.slice(0, 4)),
          Number(item.month.slice(5, 7)) - 1,
          1,
        );

        return itemDate >= startDate && itemDate <= selectedDate;
      })
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [allMonthlyData, selectedMonth]);

  // ── Categories ──────────────────────────────────────────────

  const categories = useMemo(() => {
    if (!categoryData) return [];

    return categoryData.map((item: CategoryBreakdown, index: number) => ({
      name: item.category,
      value: Number(item.total ?? 0),

      // Keep the API-provided percentage.
      // This preserves the real filtering/data behavior.
      percentage: Number(item.percentage ?? 0),

      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));
  }, [categoryData]);

  // ── Spending by Account ──────────────────────────────────────

  const accountSpending = useMemo(() => {
    if (!spendingByAccount || spendingByAccount.length === 0) {
      return [];
    }

    const mapped = spendingByAccount.map((item: any) => {
      const bankKey = item.bank as keyof typeof BANK_COLORS;

      return {
        accountId: item.account_id,
        accountName: item.name,
        bank: item.bank,
        bankLabel: BANK_LABELS[bankKey] || item.bank,
        color: BANK_COLORS[bankKey] || "#8B7355",
        total: Number(item.balance ?? 0),
      };
    });

    const totalSpending = mapped.reduce(
      (sum, account) => sum + account.total,
      0,
    );

    if (totalSpending === 0) return [];

    return mapped.map((item) => ({
      ...item,
      percentage: (item.total / totalSpending) * 100,
    }));
  }, [spendingByAccount]);

  // ── Totals ───────────────────────────────────────────────────

  const totalIncome = Number(selectedMonthData?.income ?? 0);
  const totalExpense = Number(selectedMonthData?.expenses ?? 0);
  const currentNetWorth = Number(networth?.total ?? 0);

  const savingRate =
    totalIncome > 0
      ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
      : 0;

  // ── Month navigation ────────────────────────────────────────

  const currentMonthIndex = monthOptions.findIndex(
    (month) => month.value === selectedMonth,
  );

  const currentMonthLabel =
    monthOptions[currentMonthIndex]?.label || selectedMonth;

  const goToPreviousMonth = () => {
    if (currentMonthIndex < monthOptions.length - 1) {
      // Always sets YYYY-MM
      setSelectedMonth(monthOptions[currentMonthIndex + 1].value);
    }
  };

  const goToNextMonth = () => {
    if (currentMonthIndex > 0) {
      // Always sets YYYY-MM
      setSelectedMonth(monthOptions[currentMonthIndex - 1].value);
    }
  };

  const handleMonthSelect = (value: string) => {
    setSelectedMonth(value);
    setIsMonthDropdownOpen(false);
  };

  // ── Loading ──────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-8 pb-12 animate-pulse">
        <div className="h-6 w-32 bg-[#E8E4DE]/60 rounded" />

        <div className="h-8 border-b border-dashed border-[#E8E4DE]" />

        <div className="h-56 bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px]" />

        <div className="h-24 bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px]" />

        <div className="h-48 bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px]" />
      </div>
    );
  }

  // ── Tooltip ──────────────────────────────────────────────────

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    return (
      <div className="bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px] px-3 py-2 shadow-sm">
        <p className="font-inter text-[11px] text-[#8B7355] mb-1">{label}</p>

        {payload.map((item: any) => (
          <p
            key={item.name}
            className="font-mono-num text-[12px]"
            style={{ color: item.color }}
          >
            {item.name}: {formatIDR(item.value ?? 0)}
          </p>
        ))}
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title */}

      <div>
        <h1 className="font-playfair text-[24px] text-[#1C1410]">Analytics</h1>

        <p className="font-inter text-[12px] text-[#8B7355] mt-1">
          Insights into your financial health
        </p>
      </div>

      {/* Month Selector with Dropdown */}

      <div className="flex items-center justify-center gap-6 py-2 border-b-[0.5px] border-dashed border-[#E8E4DE]">
        <Button
          onClick={goToPreviousMonth}
          disabled={currentMonthIndex >= monthOptions.length - 1}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#8B7355] hover:text-[#1C1410] disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2 font-inter text-[13px] font-medium text-[#1C1410] hover:text-[#C0392B] transition-colors px-2 py-1 rounded-[4px] focus:outline-none"
            aria-label="Select month"
          >
            <span>{currentMonthLabel}</span>
            <ChevronLeft className="w-4 h-4 text-[#8B7355] rotate-[-90deg]" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="center"
            className="w-56 max-h-64 overflow-y-auto bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px] shadow-lg p-1"
          >
            {monthOptions.map((month) => (
              <DropdownMenuItem
                key={month.value}
                onClick={() => handleMonthSelect(month.value)}
                className={`cursor-pointer font-inter text-[13px] px-3 py-2 rounded-[4px] transition-colors ${
                  month.value === selectedMonth
                    ? "bg-[#FAFAF8] text-[#1C1410] font-medium"
                    : "text-[#8B7355] hover:bg-[#FAFAF8] hover:text-[#1C1410]"
                }`}
              >
                {month.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          onClick={goToNextMonth}
          disabled={currentMonthIndex <= 0}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#8B7355] hover:text-[#1C1410] disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Net Worth Trend */}

      <section>
        <h2 className="font-inter text-[11px] font-medium tracking-wide text-[#8B7355] mb-2">
          Net Worth Trend
        </h2>

        <div className="bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px] p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="font-playfair text-[24px] text-[#1C1410]">
              {formatIDR(currentNetWorth)}
            </span>

            {chartData.length >= 2 && (
              <span className="font-inter text-[11px] text-[#8B7355]">
                {chartData.length} months
              </span>
            )}
          </div>

          {chartData.length === 0 ? (
            <p className="font-inter text-[12px] text-[#C4B5A0] text-center py-8">
              No trend data available.
            </p>
          ) : (
            <>
              <div className="w-full py-2">
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 4,
                      left: 4,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid stroke="transparent" vertical={false} />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: 10,
                        fill: COLORS.muted,
                        fontFamily: "Inter",
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickMargin={8}
                      tickFormatter={(value: string) => {
                        const [, month] = value.split("-");

                        const date = new Date(
                          Number(value.slice(0, 4)),
                          Number(month) - 1,
                          1,
                        );

                        return date
                          .toLocaleDateString("id-ID", {
                            month: "short",
                          })
                          .replace(".", "");
                      }}
                    />

                    <YAxis hide domain={["auto", "auto"]} />

                    <Tooltip content={<CustomTooltip />} />

                    <Line
                      type="monotone"
                      dataKey="income"
                      name="Income"
                      stroke="#27AE60"
                      strokeWidth={1.5}
                      dot={{
                        r: 2.5,
                        fill: "#FFFFFF",
                        stroke: "#27AE60",
                        strokeWidth: 1.5,
                      }}
                      activeDot={{
                        r: 4,
                        strokeWidth: 1.5,
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="expense"
                      name="Expense"
                      stroke="#C0392B"
                      strokeWidth={1.5}
                      dot={{
                        r: 2.5,
                        fill: "#FFFFFF",
                        stroke: "#C0392B",
                        strokeWidth: 1.5,
                      }}
                      activeDot={{
                        r: 4,
                        strokeWidth: 1.5,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Separator */}

      <div className="border-t-[0.5px] border-dashed border-[#E8E4DE]" />

      {/* Cashflow Summary */}

      <section>
        <h2 className="font-inter text-[11px] font-medium tracking-wide text-[#8B7355] mb-2">
          Cashflow Summary
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div className="bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px] p-3 text-center">
            <div className="font-inter text-[9px] font-semibold text-[#8B7355] mb-1">
              Income
            </div>

            <div className="font-mono-num text-[13px] font-medium text-[#27AE60]">
              {formatIDR(totalIncome)}
            </div>
          </div>

          <div className="bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px] p-3 text-center">
            <div className="font-inter text-[9px] font-semibold text-[#8B7355] mb-1">
              Expense
            </div>

            <div className="font-mono-num text-[13px] font-medium text-[#C0392B]">
              {formatIDR(totalExpense)}
            </div>
          </div>

          <div className="bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px] p-3 text-center">
            <div className="font-inter text-[9px] font-semibold text-[#8B7355] mb-1">
              Saving Rate
            </div>

            <div className="font-mono-num text-[13px] font-medium text-[#1C1410]">
              {savingRate}%
            </div>
          </div>
        </div>
      </section>

      {/* Separator */}

      <div className="border-t-[0.5px] border-dashed border-[#E8E4DE]" />

      {/* Spending by Category */}
      <section>
        <h2 className="font-inter text-[11px] font-medium tracking-wide text-[#8B7355] mb-3">
          Spending by Category
        </h2>

        <div className="mt-4">
          <SpendingByCategory
            data={categoryData}
            emptyMessage="No expenses yet."
          />
        </div>
      </section>

      {/* Separator */}

      <div className="border-t-[0.5px] border-dashed border-[#E8E4DE]" />

      {/* Spending by Bank Account */}

      <section>
        <h2 className="font-inter text-[11px] font-medium tracking-wide text-[#8B7355] mb-3">
          Spending by Bank Account
        </h2>

        {accountSpending.length === 0 ? (
          <div className="font-inter text-[12px] text-[#C4B5A0]">
            No spending by account.
          </div>
        ) : (
          <div className="space-y-4">
            {accountSpending.map((item) => (
              <div key={item.accountId} className="space-y-1">
                <div className="flex items-center justify-between text-[13px] font-inter">
                  <span className="text-[#1C1410] font-normal flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full inline-block shrink-0"
                      style={{
                        backgroundColor: item.color,
                      }}
                    />

                    <span className="truncate">{item.accountName}</span>

                    <span className="text-[#8B7355] text-[11px] shrink-0">
                      ({item.bankLabel})
                    </span>
                  </span>

                  <span className="font-mono-num text-[#1C1410] font-medium ml-4 shrink-0">
                    {formatIDR(item.total)} ({item.percentage.toFixed(0)}%)
                  </span>
                </div>

                <div className="w-full h-[4px] bg-[#E8E4DE] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(Math.max(item.percentage, 0), 100)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <WabiSabiFooter />
    </div>
  );
}
