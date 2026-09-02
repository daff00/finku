import { Pencil, Trash2, Plus } from "lucide-react";
import { BANK_COLORS, BANK_LABELS } from "@/lib/constants";
import type { Account } from "@/types";
import { Button } from "@/components/ui/button";

interface AccountListProps {
  accounts: Account[] | undefined;
  isLoading: boolean;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  onAdd: () => void;
}

export default function AccountList({
  accounts,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
}: AccountListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-[66px] bg-white border-[0.5px] border-border rounded-[4px] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="bg-white border-[0.5px] border-border rounded-[4px] p-6 text-center">
        <p className="text-text-secondary text-sm font-sans">No bank accounts added yet.</p>
        <Button
          variant="link"
          onClick={onAdd}
          className="mt-2 text-accent hover:text-accent-hover-strong text-[11px] font-sans gap-1 p-0 h-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Account
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {accounts.map((account) => {
        const bankColor = BANK_COLORS[account.bank] || "#6B7280";
        const bankLabel = BANK_LABELS[account.bank] || account.bank;
        const lastFour = account.account_number
          ? account.account_number.slice(-4)
          : "None";

        return (
          <div
            key={account.id}
            className="bg-white border-[0.5px] border-border rounded-[4px] p-3 flex items-center justify-between gap-4 border-l-[3px] hover:bg-bg transition-colors group"
            style={{ borderLeftColor: bankColor }}
          >
            <div className="min-w-0">
              <div className="font-sans text-sm font-medium text-text-primary truncate">
                {account.name}
              </div>
              <div className="font-sans text-[10px] text-text-secondary mt-0.5">
                {bankLabel}
                <span className="ml-1">• {lastFour}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {account.is_active === false && (
                <span className="text-[9px] uppercase text-text-secondary bg-surface-muted px-1.5 py-0.5 rounded">
                  Inactive
                </span>
              )}

              <div className="flex items-center gap-0.5 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                <button
                  onClick={() => onEdit(account)}
                  className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg rounded-[2px] transition-colors"
                  title="Edit account"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(account)}
                  className="p-1.5 text-text-secondary hover:text-accent hover:bg-danger-subtle-hover rounded-[2px] transition-colors"
                  title="Delete account"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}