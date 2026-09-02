// frontend/src/components/dashboard/AccountGrid.tsx
import type { Account } from "@/types";
import { BANK_COLORS, BANK_LABELS } from "@/lib/constants";
import { useCurrency } from "@/contexts/CurrencyContext";

interface AccountGridProps {
  accounts: Account[];
  balanceMap: Record<number, string>;
  showAmount: boolean;
}

export default function AccountGrid({ accounts, balanceMap, showAmount }: AccountGridProps) {
  const { formatAmount } = useCurrency();

  if (accounts.length === 0) {
    return <div className="mt-3 text-[12px] text-text-secondary font-sans">No accounts yet.</div>;
  }

  return (
    <div
      className="
        mt-3
        flex sm:grid
        gap-3
        overflow-x-auto sm:overflow-visible
        snap-x snap-mandatory sm:snap-none
        -mx-4 px-4 sm:mx-0 sm:px-0
        sm:grid-cols-2
      "
    >
      {accounts.map((account) => {
        const balance = balanceMap[account.id] ?? "0";
        const bankColor = account.color || BANK_COLORS[account.bank] || "var(--color-bank-other)";
        const bankLabel = BANK_LABELS[account.bank] || account.bank;

        return (
          <div
            key={account.id}
            className="
              shrink-0 snap-start
              w-[75vw] max-w-[280px] sm:w-auto sm:max-w-none
              bg-surface border-[0.5px] border-border rounded-[4px]
              p-4
              hover:bg-surface-hover transition-colors
            "
            style={{ borderLeftWidth: "3px", borderLeftColor: bankColor }}
          >
            <p className="text-[13px] text-text-primary font-serif">{account.name}</p>
            <p className="text-[10px] text-text-secondary font-sans mt-0.5">
              {bankLabel} · {account.type}
            </p>
            <p className="font-mono text-[15px] text-text-primary mt-3">
              {showAmount
                ? formatAmount(Number(balance), account.currency ?? "IDR")
                : "•••••••••"}
            </p>
          </div>
        );
      })}
    </div>
  );
}