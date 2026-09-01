// frontend/src/components/transactions/TransactionFilters.tsx
import { TransactionTypeEnum } from "@/types";
import type { Transaction } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
              ${
                isSelected
                  ? "bg-accent text-white border-accent hover:bg-accent-hover"
                  : "bg-surface text-text-secondary border-border hover:bg-border/30 hover:text-text-primary"
              }
            `}
          >
            {filter.label}
          </button>
        );
      })}

      <Select
        value={selectedBank ?? "ALL"}
        onValueChange={(value) => onBankChange(value === "ALL" ? null : value)}
      >
        <SelectTrigger className="h-8 w-[150px] border-[0.5px] border-border bg-surface text-[12px] text-text-secondary focus:ring-0 focus:ring-offset-0">
          <SelectValue placeholder="All Banks" />
        </SelectTrigger>

        <SelectContent className="border-[0.5px] border-border bg-surface shadow-lg">
          <SelectItem value="ALL">All Banks</SelectItem>
          {bankOptions.map((bank) => (
            <SelectItem key={bank} value={bank}>
              {bank}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}