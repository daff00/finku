import { formatIDR, toTitleCase } from "@/lib/formatters";
import { CATEGORY_COLORS } from "@/lib/constants";

export type SpendingCategory = {
  category: string;
  amount: number;
  percentage: number;
};

type Props = {
  data: SpendingCategory[];
  emptyMessage?: string;
};

export default function SpendingByCategory({
  data,
  emptyMessage = "No spending by category.",
}: Props) {
  if (data.length === 0) {
    return (
      <p className="text-[12px] text-[#C4B5A0] font-sans">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {data.map(({ category, amount, percentage }) => {
        const color = CATEGORY_COLORS[category] || "#8B7355";

        return (
          <div key={category} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-[12px] font-sans">
              <span className="text-[#1C1410] font-normal truncate">
                {toTitleCase(category)}
              </span>

              <span className="font-mono text-[#8B7355] flex-shrink-0">
                {formatIDR(amount)} ({percentage}%)
              </span>
            </div>

            <div className="w-full h-[4px] bg-[#E8E4DE] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(Math.max(percentage, 0), 100)}%`,
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