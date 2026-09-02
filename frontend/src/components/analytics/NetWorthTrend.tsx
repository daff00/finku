// frontend/src/components/analytics/NetWorthTrend.tsx
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  muted: "#8B7355",
};

interface NetWorthTrendProps {
  netWorth: number;
  chartData: Array<{ month: string; income: number; expense: number }>;
  showAmount?: boolean;
}

export default function NetWorthTrend({
  netWorth,
  chartData,
  showAmount = true,
}: NetWorthTrendProps) {
  const { formatAmount } = useCurrency();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="bg-white border-[0.5px] border-border rounded-[4px] px-3 py-2 shadow-sm">
        <p className="font-sans text-[11px] text-text-secondary mb-1">{label}</p>
        {payload.map((item: any) => (
          <p key={item.name} className="font-mono text-[12px]" style={{ color: item.color }}>
            {item.name}: {showAmount ? formatAmount(Number(item.value ?? 0)) : "•••••••••"}
          </p>
        ))}
      </div>
    );
  };

  return (
    <section>
      <h2 className="font-sans text-[11px] font-medium tracking-wide text-text-secondary mb-2">
        Net Worth Trend
      </h2>

      <div className="bg-white border-[0.5px] border-border rounded-[4px] p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="font-serif text-2xl text-text-primary">
            {showAmount ? formatAmount(netWorth) : "•••••••••"}
          </span>
          {chartData.length >= 2 && (
            <span className="font-sans text-[11px] text-text-secondary">{chartData.length} months</span>
          )}
        </div>

        {chartData.length === 0 ? (
          <p className="font-sans text-[12px] text-text-muted text-center py-8">No trend data available.</p>
        ) : (
          <div className="w-full py-2">
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={chartData} margin={{ top: 10, right: 4, left: 4, bottom: 0 }}>
                <CartesianGrid stroke="transparent" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: COLORS.muted, fontFamily: "Inter" }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  tickFormatter={(value: string) => {
                    const [, month] = value.split("-");
                    const date = new Date(Number(value.slice(0, 4)), Number(month) - 1, 1);
                    return date.toLocaleDateString("id-ID", { month: "short" }).replace(".", "");
                  }}
                />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#var(--color-income)"
                  strokeWidth={1.5}
                  dot={{ r: 2.5, fill: "#FFFFFF", stroke: "#var(--color-income)", strokeWidth: 1.5 }}
                  activeDot={{ r: 4, strokeWidth: 1.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  name="Expense"
                  stroke="#C0392B"
                  strokeWidth={1.5}
                  dot={{ r: 2.5, fill: "#FFFFFF", stroke: "#C0392B", strokeWidth: 1.5 }}
                  activeDot={{ r: 4, strokeWidth: 1.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}