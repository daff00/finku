// frontend/src/components/dashboard/NetWorthCard.tsx
import { formatIDR } from "@/lib/formatters";
import { useCurrency } from "@/contexts/CurrencyContext";

interface NetWorthCardProps {
  totalNetworth: string;
  accountCount: number;
  netChange: number;
  showAmount: boolean;
}

export default function NetWorthCard({
  totalNetworth,
  accountCount,
  netChange,
  showAmount,
}: NetWorthCardProps) {
  const { currency, formatAmount, rate } = useCurrency();

  const networthNum = Number(totalNetworth);
  const netChangeNum = Number(netChange);
  const isPositive = netChangeNum >= 0;

  const displayNetworth = showAmount ? formatAmount(networthNum) : "•••••••••";
  const displayNetChange = showAmount ? formatAmount(netChangeNum) : "•••••••••";

  return (
    <div className="bg-surface border-[0.5px] border-border border-l-[3px] border-l-text-secondary rounded-[4px] p-5">
      {/* Currency label */}
      <p className="text-[11px] text-text-secondary font-sans mb-1">
        {currency === "IDR" ? "🇮🇩 IDR" : "🇺🇸 USD"}
      </p>

      {/* Net worth amount */}
      <p className="font-mono text-3xl sm:text-4xl text-text-primary tracking-tight">
        {displayNetworth}
      </p>

      <p className="font-sans text-[11px] text-text-secondary mt-1">
        Total across {accountCount} accounts
      </p>

      {netChange !== 0 && (
        <p
          className={`font-mono text-[11px] mt-3 ${
            isPositive ? "text-income" : "text-expense"
          }`}
        >
          {isPositive ? "+" : ""}
          {displayNetChange}
          <span className="font-sans text-text-secondary ml-1">this month</span>
        </p>
      )}

      {/* Show exchange rate info when in USD mode */}
      {currency === "USD" && rate && (
        <p className="text-[9px] text-text-muted/60 font-sans mt-2">
          1 USD = {formatIDR(rate)}
        </p>
      )}
    </div>
  );
}