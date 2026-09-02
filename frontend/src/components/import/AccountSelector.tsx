// frontend/src/components/import/AccountSelector.tsx
import { ChevronDown } from "lucide-react";
import { BANK_LABELS } from "@/lib/constants";
import type { Account } from "@/types";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccount: Account | null;
  onSelect: (id: number) => void;
  isLoading: boolean;
}

export default function AccountSelector({
  accounts,
  selectedAccount,
  onSelect,
  isLoading,
}: AccountSelectorProps) {
  return (
    <div className="space-y-1.5">
      <label className="block font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
        Target Account
      </label>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="
            w-full justify-between
            h-10 rounded-[4px]
            border-[0.5px] border-border
            bg-white
            px-3
            font-sans text-[12px] text-text-primary
            hover:bg-bg
            focus:border-text-primary focus:ring-0 focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center
          "
          disabled={isLoading || accounts.length === 0}
        >
          <span className="truncate">
            {selectedAccount
              ? `${selectedAccount.name} · ${BANK_LABELS[selectedAccount.bank] ?? selectedAccount.bank}`
              : isLoading
              ? "Loading accounts..."
              : "Select an account"}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={4}
          className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-[4px] border-[0.5px] border-border bg-white shadow-[0_8px_24px_rgba(28,20,16,0.08)] p-1"
        >
          {accounts.length === 0 ? (
            <div className="px-2 py-1.5 text-[12px] text-text-secondary font-sans">
              No accounts available
            </div>
          ) : (
            accounts.map((account) => (
              <DropdownMenuItem
                key={account.id}
                onClick={() => onSelect(account.id)}
                className="cursor-pointer rounded-[4px] px-2 py-1.5 font-sans text-[12px] text-text-primary hover:bg-bg focus:bg-bg"
              >
                {account.name} · {BANK_LABELS[account.bank] ?? account.bank}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}