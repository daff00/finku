// frontend/src/components/transactions/TransactionFilters.tsx
import { ChevronDown } from "lucide-react";
import { TransactionTypeEnum } from "@/types";
import type { Transaction } from "@/types";
import { BANK_LABELS } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TYPE_FILTERS = [
  { label: "All", value: undefined },
  { label: "Expense", value: TransactionTypeEnum.EXPENSE },
  { label: "Income", value: TransactionTypeEnum.INCOME },
  { label: "Transfer", value: TransactionTypeEnum.TRANSFER },
] as const;

type TransactionFilter = Transaction["type"] | undefined;

interface TransactionFiltersProps {
  type: TransactionFilter;
  onTypeChange: (value: TransactionFilter) => void;
  selectedBank: string | null;
  onBankChange: (value: string | null) => void;
  bankOptions: string[];
}

export default function TransactionFilters({
  type,
  onTypeChange,
  selectedBank,
  onBankChange,
  bankOptions,
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {TYPE_FILTERS.map((filter) => {
        const isSelected = type === filter.value;

        return (
          <button
            key={filter.label}
            onClick={() => onTypeChange(filter.value)}
            className={`
              shrink-0 rounded-[4px] px-3.5 py-1.5
              font-sans text-[12px] font-medium
              transition-colors cursor-pointer
              border-[0.5px]
              ${isSelected
                ? "bg-accent text-white border-accent hover:bg-accent-hover"
                : "bg-surface text-text-secondary border-border hover:bg-border/30 hover:text-text-primary"
              }
            `}
          >
            {filter.label}
          </button>
        );
      })}

      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex h-8 w-[150px] items-center justify-between gap-2 rounded-[4px] border-[0.5px] border-border bg-surface px-3 font-sans text-[12px] text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
          aria-label="Filter by bank"
        >
          <span className="truncate">
            {selectedBank ? (BANK_LABELS[selectedBank] ?? selectedBank) : "All Banks"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="w-[150px] max-h-64 overflow-y-auto bg-surface border-[0.5px] border-border rounded-[4px] shadow-[0_8px_24px_rgba(28,20,16,0.08)] p-1"
        >
          <DropdownMenuItem
            onClick={() => onBankChange(null)}
            className={`cursor-pointer font-sans text-[13px] px-3 py-2 rounded-[4px] transition-colors ${selectedBank === null
                ? "bg-bg text-text-primary font-medium"
                : "text-text-secondary hover:bg-bg hover:text-text-primary"
              }`}
          >
            All Banks
          </DropdownMenuItem>
          {bankOptions.map((bank) => (
            <DropdownMenuItem
              key={bank}
              onClick={() => onBankChange(bank)}
              className={`cursor-pointer font-sans text-[13px] px-3 py-2 rounded-[4px] transition-colors ${selectedBank === bank
                  ? "bg-bg text-text-primary font-medium"
                  : "text-text-secondary hover:bg-bg hover:text-text-primary"
                }`}
            >
              {BANK_LABELS[bank] ?? bank}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}