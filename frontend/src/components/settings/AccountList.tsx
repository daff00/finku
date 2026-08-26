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
          <div key={i} className="h-[66px] bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px] p-6 text-center">
        <p className="text-[#8B7355] text-sm font-sans">No bank accounts added yet.</p>
        <Button
          variant="link"
          onClick={onAdd}
          className="mt-2 text-[#C0392B] hover:text-[#A83224] text-[11px] font-sans gap-1 p-0 h-auto"
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

        return (
          <div
            key={account.id}
            className="bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px] p-3 flex items-center justify-between gap-4 border-l-[3px] hover:bg-[#FAFAF8] transition-colors group"
            style={{ borderLeftColor: bankColor }}
          >
            <div className="min-w-0">
              <div className="font-sans text-sm font-medium text-[#1C1410] truncate">
                {account.name}
              </div>
              {/* <div className="font-sans text-[10px] text-[#8B7355] mt-0.5">
                {bankLabel}
              </div> */}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {account.is_active === false && (
                <span className="text-[9px] uppercase text-[#8B7355] bg-[#F2EFE9] px-1.5 py-0.5 rounded">
                  Inactive
                </span>
              )}

              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(account)}
                  className="p-1.5 text-[#8B7355] hover:text-[#1C1410] hover:bg-[#FAFAF8] rounded-[2px] transition-colors"
                  title="Edit account"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(account)}
                  className="p-1.5 text-[#8B7355] hover:text-[#C0392B] hover:bg-[#FEF2F2] rounded-[2px] transition-colors"
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