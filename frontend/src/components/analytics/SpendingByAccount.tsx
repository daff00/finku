// frontend/src/components/analytics/SpendingByAccount.tsx
import { formatIDR } from "@/lib/formatters";

interface AccountSpendingItem {
  accountId: number;
  accountName: string;
  bankLabel: string;
  color: string;
  total: number;
  percentage: number;
}

interface SpendingByAccountProps {
  data: AccountSpendingItem[];
  emptyMessage?: string;
}

export default function SpendingByAccount({ data, emptyMessage = "No spending by account." }: SpendingByAccountProps) {
  if (!data || data.length === 0) {
    return <p className="font-sans text-[12px] text-[#C4B5A0]">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.accountId} className="space-y-1">
          <div className="flex items-center justify-between text-[13px] font-sans">
            <span className="text-[#1C1410] font-normal flex items-center gap-2 min-w-0">
              <span
                className="w-2 h-2 rounded-full inline-block shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate">{item.accountName}</span>
              <span className="text-[#8B7355] text-[11px] shrink-0">({item.bankLabel})</span>
            </span>
            <span className="font-mono text-[#1C1410] font-medium ml-4 shrink-0">
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
  );
}