// frontend/src/components/dashboard/NetWorthCard.tsx
import { formatIDR } from "@/lib/formatters";

interface NetWorthCardProps {
  totalNetworth: string;
  accountCount: number;
  netChange: number;
}

export default function NetWorthCard({ totalNetworth, accountCount, netChange }: NetWorthCardProps) {
  return (
    <section>
      <div className="mb-2">
        <p className="text-[14px] uppercase tracking-[0.12em] text-[#8B7355] font-sans font-bold">
          NET WORTH
        </p>
      </div>

      <div className="bg-surface border-[0.5px] border-border border-l-[3px] border-l-[#8B7355] rounded-[4px] p-5">
        <p className="font-mono text-3xl sm:text-4xl text-text-primary tracking-tight">
          {formatIDR(totalNetworth)}
        </p>
        <p className="font-sans text-[11px] text-[#8B7355] mt-1">
          Total across {accountCount} accounts
        </p>

        {netChange !== 0 && (
          <p className={`font-mono text-[11px] mt-3 ${netChange >= 0 ? "text-income" : "text-expense"}`}>
            {netChange >= 0 ? "+" : ""}
            {formatIDR(netChange)}
            <span className="font-sans text-[#8B7355] ml-1">this month</span>
          </p>
        )}
      </div>
    </section>
  );
}