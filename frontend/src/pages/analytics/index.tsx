// frontend/src/pages/AnalyticsPage.tsx
import { useMemo } from 'react';
import {
  useNetworth,
  useMonthly,
  useCategories,
  useSpendingByAccount,
} from '@/hooks';
import { formatIDR } from '@/lib/formatters';
import { BANK_LABELS, BANK_COLORS } from '@/lib/constants';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ── Import types ───────────────────────────────────────────────
import type { MonthlySummary, CategoryBreakdown } from '@/types';

// ── Colors ─────────────────────────────────────────────────────
const COLORS = {
  income: '#27AE60',
  expense: '#C0392B',
  accent: '#C0392B',
  textMuted: '#C4B5A0',
  border: '#E8E4DE',
};

const CATEGORY_COLORS = [
  '#C0392B',
  '#E67E22',
  '#F1C40F',
  '#2ECC71',
  '#3498DB',
  '#9B59B6',
  '#1ABC9C',
  '#E74C3C',
  '#34495E',
  '#16A085',
];

export default function AnalyticsPage() {
  // ── Data ────────────────────────────────────────────────────
  const { data: networth, isLoading: networthLoading } = useNetworth();
  const { data: monthlyData, isLoading: monthlyLoading } = useMonthly();
  const { data: categoryData, isLoading: categoryLoading } = useCategories();
  const { data: spendingByAccount, isLoading: spendingLoading } = useSpendingByAccount();

  const isLoading = networthLoading || monthlyLoading || categoryLoading || spendingLoading;

  // ── Process data for charts ────────────────────────────────
  const chartData = useMemo(() => {
    if (!monthlyData) return [];
    return monthlyData.map((item: MonthlySummary) => ({
      month: item.month.slice(0, 7),
      income: Number(item.income ?? 0),
      expense: Number(item.expenses ?? 0),
      net: Number(item.net ?? 0),
    }));
  }, [monthlyData]);

  const categories = useMemo(() => {
    if (!categoryData) return [];
    return categoryData.map((item: CategoryBreakdown, index: number) => ({
      name: item.category,
      value: Number(item.total ?? 0),
      percentage: Number(item.percentage ?? 0),
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));
  }, [categoryData]);

  const accountSpending = useMemo(() => {
    if (!spendingByAccount || spendingByAccount.length === 0) return [];

    const mapped = spendingByAccount.map((item: any) => {
      const bankKey = item.bank as keyof typeof BANK_COLORS;
      return {
        accountId: item.account_id,
        accountName: item.name,
        bank: item.bank,
        bankLabel: BANK_LABELS[bankKey] || item.bank,
        color: BANK_COLORS[bankKey] || '#6B7280',
        total: Number(item.balance ?? 0),
      };
    });

    const totalSpending = mapped.reduce((sum, acc) => sum + acc.total, 0);
    if (totalSpending === 0) return [];

    return mapped.map((item) => ({
      ...item,
      percentage: (item.total / totalSpending) * 100,
    }));
  }, [spendingByAccount]);

  // ── Compute totals ──────────────────────────────────────────
  const totalIncome = monthlyData?.reduce(
    (sum: number, m: MonthlySummary) => sum + Number(m.income ?? 0),
    0
  ) ?? 0;

  const totalExpense = monthlyData?.reduce(
    (sum: number, m: MonthlySummary) => sum + Number(m.expenses ?? 0),
    0
  ) ?? 0;

  const currentNetWorth = Number(networth?.total ?? 0);

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-border/50 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-border/50 rounded-[4px]" />
          ))}
        </div>
        <div className="h-64 bg-border/50 rounded-[4px]" />
        <div className="h-64 bg-border/50 rounded-[4px]" />
      </div>
    );
  }

  // ── Custom tooltip ──────────────────────────────────────────
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border rounded-[4px] p-3 shadow-sm">
          <p className="text-xs font-medium text-text-primary">{label}</p>
          {payload.map((p: any) => (
            <p key={p.name} className="text-sm font-mono" style={{ color: p.color }}>
              {p.name}: {formatIDR(p.value ?? 0)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // ── Render ──
  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-light text-text-primary tracking-tight font-serif">
          Analytics
        </h1>
        <p className="text-sm text-text-muted mt-1 font-sans">
          Insights into your financial health
        </p>
      </div>

      {/* Key Metrics */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-4 border-l-[3px] border-income">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted font-sans">
              Total Income
            </p>
            <p className="font-mono text-2xl text-income mt-1">
              +{formatIDR(totalIncome)}
            </p>
          </div>
          <div className="card p-4 border-l-[3px] border-expense">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted font-sans">
              Total Expense
            </p>
            <p className="font-mono text-2xl text-expense mt-1">
              -{formatIDR(totalExpense)}
            </p>
          </div>
          <div className="card p-4 border-l-[3px] border-accent">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted font-sans">
              Current Net Worth
            </p>
            <p className="font-mono text-2xl text-text-primary mt-1">
              {formatIDR(currentNetWorth)}
            </p>
          </div>
        </div>
      </section>

      {/* Monthly Trends */}
      <section>
        <h2 className="label-section mb-3 font-serif">Monthly Trends</h2>
        <div className="card p-4">
          {chartData.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-8 font-sans">
              No data available for the selected period.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={COLORS.border}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: COLORS.textMuted, fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: COLORS.textMuted, fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) => formatIDR(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke={COLORS.income}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  name="Expense"
                  stroke={COLORS.expense}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* ── Spending by Category ──────────────────────────────── */}
      <section>
        <h2 className="label-section mb-3 font-serif">Spending by Category</h2>
        <div className="card p-4">
          {categories.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-8 font-sans">
              No category data available.
            </p>
          ) : (
            <div className="space-y-2">
              {categories.map((item, index) => (
                <div
                  key={item.name}
                  className="relative p-3 rounded-[4px] bg-[#FAFAF8] hover:bg-[#F2EFE9] transition-colors overflow-hidden"
                >
                  {/* Colored percentage bar */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-r-[4px] transition-all"
                    style={{
                      width: `${Math.min(item.percentage, 100)}%`,
                      backgroundColor: item.color,
                      opacity: 0.2,
                    }}
                  />
                  <div className="relative flex items-center justify-between z-10">
                    <span className="text-sm text-text-primary font-serif">
                      {item.name}
                    </span>
                    <span className="text-sm font-mono text-text-secondary font-sans">
                      {formatIDR(item.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Spending by Bank Account ───────────────────────────── */}
      <section>
        <h2 className="label-section mb-3 font-serif">Spending by Bank Account</h2>
        <div className="card p-4">
          {accountSpending.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-8 font-sans">
              No spending data by account available.
            </p>
          ) : (
            <div className="space-y-2">
              {accountSpending.map((item) => (
                <div
                  key={item.accountId}
                  className="relative p-3 rounded-[4px] bg-[#FAFAF8] hover:bg-[#F2EFE9] transition-colors overflow-hidden border-l-[3px]"
                  style={{ borderLeftColor: item.color }}
                >
                  {/* Colored percentage bar */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-r-[4px] transition-all"
                    style={{
                      width: `${Math.min(item.percentage, 100)}%`,
                      backgroundColor: item.color,
                      opacity: 0.15,
                    }}
                  />
                  <div className="relative flex items-center justify-between z-10">
                    <div className="min-w-0">
                      <span className="text-sm text-text-primary font-serif">
                        {item.accountName}
                      </span>
                      <span className="text-xs text-text-muted font-sans ml-2">
                        ({item.bankLabel})
                      </span>
                    </div>
                    <div className="flex items-center gap-4 font-sans flex-shrink-0">
                      <span className="text-sm font-mono text-text-secondary">
                        {formatIDR(item.total)}
                      </span>
                      <span className="text-xs text-text-muted w-12 text-right">
                        {item.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Wabi-Sabi Footer */}
      <div className="border-t border-dashed border-border/50 pt-6 mt-8">
        <p className="text-center text-[11px] text-text-muted/60 leading-relaxed max-w-md mx-auto font-serif">
          WABI-SABI · 伝家
        </p>
        <p className="text-center text-[10px] text-text-muted/40 leading-relaxed max-w-md mx-auto mt-1 font-sans">
          Menghargai proses finansial bertahap. Fokus pada kejelasan angka,<br />
          kurangi distraksi, dan jaga ruang bernapas (Ma).
        </p>
      </div>
    </div>
  );
}