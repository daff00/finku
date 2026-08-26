// frontend/src/components/dashboard/AccountGrid.tsx
import type { Account } from "@/types";
import { BANK_COLORS, BANK_LABELS } from "@/lib/constants";
import { formatIDR } from "@/lib/formatters";

interface AccountGridProps {
  accounts: Account[];
  balanceMap: Record<number, string>;
}

export default function AccountGrid({ accounts, balanceMap }: AccountGridProps) {
  if (accounts.length === 0) {
    return (
      <div className="mt-3 text-[12px] text-[#8B7355] font-sans">
        No accounts yet.
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#8B7355] font-sans">
          ACCOUNTS ({accounts.length})
        </p>
        <span className="text-[10px] text-[#8B7355] font-sans">{accounts.length} total</span>
      </div>

      {/* Desktop grid */}
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
              <p className="text-[13px] text-text-primary font-serif">{account.name}</p>
              <p className="text-[10px] text-[#8B7355] font-sans mt-0.5">
                {bankLabel} · {account.type}
              </p>
              <p className="font-mono text-[15px] text-text-primary mt-3">{formatIDR(balance)}</p>
            </div>
          );
        })}
      </div>

      {/* Mobile horizontal scroll */}
      <div className="sm:hidden flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 mt-3">
        {accounts.map((account) => {
          const balance = balanceMap[account.id] ?? "0";
          const bankColor = BANK_COLORS[account.bank] || "#8B7355";
          const bankLabel = BANK_LABELS[account.bank] || account.bank;

          return (
            <div
              key={account.id}
              className="min-w-[150px] bg-surface border-[0.5px] border-border rounded-[4px] p-3 flex-shrink-0"
              style={{ borderTopWidth: "2px", borderTopColor: bankColor }}
            >
              <p className="text-[12px] text-text-primary font-serif truncate">{account.name}</p>
              <p className="text-[9px] text-[#8B7355] font-sans mt-0.5 truncate">{bankLabel}</p>
              <p className="font-mono text-[14px] text-text-primary mt-2">{formatIDR(balance)}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}