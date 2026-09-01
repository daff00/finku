// frontend/src/components/analytics/QuickInsights.tsx
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Target, PiggyBank } from "lucide-react";
import type { CategoryBreakdown } from "@/types";
import { formatIDR } from "@/lib/formatters";

type Insight = {
  icon: React.ReactNode;
  text: string;
  type: "success" | "warning" | "danger" | "info";
};

type QuickInsightsProps = {
  totalIncome: number;
  totalExpense: number;
  savingRate: number;
  categoryData: CategoryBreakdown[];
  accountSpending: { accountName: string; total: number; percentage: number }[];
  chartData: { month: string; income: number; expense: number }[];
  currentNetWorth: number;
  showAmount?: boolean;
};

function getStatusColor(type: Insight["type"]) {
  switch (type) {
    case "success":
      return "bg-[#F6FAF7] border-[#D8E8DC] text-[#27AE60]";
    case "warning":
      return "bg-[#FEF9F0] border-[#F5E6D0] text-[#E8750A]";
    case "danger":
      return "bg-[#FEF8F7] border-[#E8D2CE] text-[#C0392B]";
    default:
      return "bg-[#FAFAF8] border-[#E8E4DE] text-[#8B7355]";
  }
}

function maskAmount(text: string): string {
  // Replace formatted currency with masked version
  return text.replace(/Rp\s?[\d.,]+/g, "•••••••••");
}

function maskPercentage(text: string): string {
  // Replace percentage with masked version
  return text.replace(/\d+%/g, "••%");
}

export default function QuickInsights({
  totalIncome,
  totalExpense,
  savingRate,
  categoryData,
  accountSpending,
  chartData,
  currentNetWorth,
  showAmount = true,
}: QuickInsightsProps) {
  const insights: Insight[] = [];

  const formatWithMask = (amount: number): string => {
    return showAmount ? formatIDR(amount) : "•••••••••";
  };

  const formatPercent = (value: number): string => {
    return showAmount ? `${value}%` : "••%";
  };

  // ── 1. Saving Rate ──
  if (savingRate <= 0) {
    insights.push({
      icon: <AlertCircle className="h-4 w-4 shrink-0" />,
      text: `You're not saving any income. Consider reviewing your expenses.`,
      type: "danger",
    });
  } else if (savingRate < 10) {
    insights.push({
      icon: <AlertCircle className="h-4 w-4 shrink-0" />,
      text: `Your saving rate is ${formatPercent(savingRate)} — try to aim for at least 10%.`,
      type: "warning",
    });
  } else if (savingRate >= 20 && savingRate <= 40) {
    insights.push({
      icon: <CheckCircle className="h-4 w-4 shrink-0" />,
      text: `You're saving ${formatPercent(savingRate)} of your income — that's a healthy rate!`,
      type: "success",
    });
  } else if (savingRate > 40) {
    insights.push({
      icon: <PiggyBank className="h-4 w-4 shrink-0" />,
      text: `You're saving ${formatPercent(savingRate)} of your income — impressive discipline!`,
      type: "success",
    });
  }

  // ── 2. Income vs Expense ──
  if (totalExpense > totalIncome) {
    insights.push({
      icon: <AlertCircle className="h-4 w-4 shrink-0" />,
      text: `You're spending more than you earn this month. Review your budget.`,
      type: "danger",
    });
  } else if (totalIncome > 0 && totalExpense < totalIncome * 0.5) {
    insights.push({
      icon: <CheckCircle className="h-4 w-4 shrink-0" />,
      text: `You're living well below your means — keep it up!`,
      type: "success",
    });
  }

  // ── 3. Top Spending Category ──
  const categories = categoryData.map((item) => ({
    category: item.category,
    total: Number(item.total ?? 0),
    percentage: Number(item.percentage ?? 0),
  }));

  if (categories.length > 0) {
    const top = categories[0];
    insights.push({
      icon: <Target className="h-4 w-4 shrink-0" />,
      text: `Your top expense: "${top.category}" (${top.percentage.toFixed(0)}% of total)`,
      type: "info",
    });

    if (top.percentage > 40) {
      insights.push({
        icon: <AlertCircle className="h-4 w-4 shrink-0" />,
        text: `Over 40% of your spending is on "${top.category}" — consider diversifying.`,
        type: "warning",
      });
    }
  }

  // ── 4. Spending Trend ──
  if (chartData.length >= 2) {
    const current = chartData[chartData.length - 1];
    const previous = chartData[chartData.length - 2];

    const expenseChange = current.expense - previous.expense;
    const expensePct = previous.expense > 0 ? (expenseChange / previous.expense) * 100 : 0;

    if (expensePct > 20) {
      insights.push({
        icon: <TrendingUp className="h-4 w-4 shrink-0" />,
        text: `Your spending increased by ${expensePct.toFixed(0)}% compared to last month.`,
        type: "warning",
      });
    } else if (expensePct < -20) {
      insights.push({
        icon: <TrendingDown className="h-4 w-4 shrink-0" />,
        text: `Your spending decreased by ${Math.abs(expensePct).toFixed(0)}% — great job!`,
        type: "success",
      });
    }
  }

  // ── 5. Net Worth ──
  if (currentNetWorth > 0) {
    insights.push({
      icon: <CheckCircle className="h-4 w-4 shrink-0" />,
      text: `Your net worth is ${formatWithMask(currentNetWorth)} — you're building wealth!`,
      type: "success",
    });
  } else if (currentNetWorth < 0) {
    insights.push({
      icon: <AlertCircle className="h-4 w-4 shrink-0" />,
      text: `Your net worth is negative — focus on reducing debt.`,
      type: "danger",
    });
  }

  // ── 6. Top Spending Account ──
  if (accountSpending.length > 0) {
    const topAccount = accountSpending[0];
    if (topAccount.total > 0) {
      insights.push({
        icon: <Target className="h-4 w-4 shrink-0" />,
        text: `Most spending comes from "${topAccount.accountName}" (${topAccount.percentage.toFixed(0)}%)`,
        type: "info",
      });
    }
  }

  const displayInsights = insights.slice(0, 7);

  if (displayInsights.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="font-sans text-[12px] text-text-muted">
          Add more data to receive personalized financial insights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-text-secondary">
        Quick Insights
      </p>

      <div className="space-y-2">
        {displayInsights.map((insight, index) => (
          <div
            key={index}
            className={`flex items-start gap-2.5 rounded-[4px] border-[0.5px] px-3.5 py-2.5 ${getStatusColor(
              insight.type
            )}`}
          >
            {insight.icon}
            <span className="font-sans text-[12px] leading-relaxed text-[#1C1410]">
              {insight.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}