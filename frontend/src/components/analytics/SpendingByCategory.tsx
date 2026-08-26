// frontend/src/components/analytics/SpendingByCategory.tsx
import { formatIDR, toTitleCase } from "@/lib/formatters";

const CATEGORY_COLORS = [
  "#C0392B", "#E67E22", "#F1C40F", "#2ECC71", "#3498DB",
  "#9B59B6", "#1ABC9C", "#E74C3C", "#34495E", "#16A085",
];

interface CategoryItem {
  category: string;
  total: string | number; // ✅ accept both string and number
  percentage: number;
}

interface SpendingByCategoryProps {
  data: CategoryItem[];
  emptyMessage?: string;
}

export default function SpendingByCategory({ data, emptyMessage = "No data available." }: SpendingByCategoryProps) {
  if (!data || data.length === 0) {
    return <p className="font-sans text-[12px] text-[#C4B5A0]">{emptyMessage}</p>;
  }

  // Convert total to number and sort
  const sorted = [...data]
    .map(item => ({
      ...item,
      total: Number(item.total) || 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {sorted.map((item, index) => {
        const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
        return (
          <div key={item.category} className="space-y-1">
            <div className="flex items-center justify-between text-[13px] font-sans">
              <span className="text-[#1C1410] font-normal">{toTitleCase(item.category)}</span>
              <span className="font-mono text-[#1C1410]">
                {formatIDR(item.total)} ({item.percentage.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full h-[4px] bg-[#E8E4DE] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(Math.max(item.percentage, 0), 100)}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}