// frontend/src/components/dashboard/AccountGrid.tsx
import type { Account } from "@/types";
import { BANK_COLORS, BANK_LABELS } from "@/lib/constants";
import { formatIDR } from "@/lib/formatters";

interface AccountGridProps {
  accounts: Account[];
  balanceMap: Record<number, string>;
  showAmount: boolean;
}

export default function AccountGrid({ accounts, balanceMap, showAmount }: AccountGridProps) {
  if (accounts.length === 0) {
    return (
      <div className="mt-3 text-[12px] text-[#8B7355] font-sans">
        No accounts yet.
      </div>
    );
  }

  return (
    <div className="hidden sm:grid grid-cols-2 gap-3 mt-3">
      {accounts.map((account) => {
        const balance = balanceMap[account.id] ?? "0";
        const bankColor = BANK_COLORS[account.bank] || "#8B7355";
        const bankLabel = BANK_LABELS[account.bank] || account.bank;

        return (
          <div
            key={account.id}
            className="bg-surface border-[0.5px] border-border rounded-[4px] p-4 hover:bg-border/10 transition-colors"
            style={{ borderLeftWidth: "3px", borderLeftColor: bankColor }}
          >
            <p className="text-[13px] text-text-primary font-sans">{account.name}</p>
            <p className="text-[10px] text-[#8B7355] font-sans mt-0.5">
              {bankLabel} · {account.type}
            </p>
            <p className="font-mono text-[15px] text-text-primary mt-3">
              {showAmount ? formatIDR(balance) : "•••••••••"}
            </p>
          </div>
        );
      })}
    </div>
  );
}