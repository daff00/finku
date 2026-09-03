// frontend/src/components/transactions/EditTransactionSheet.tsx
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

import { useUpdateTransaction } from "@/hooks";
import { CATEGORY_LABELS } from "@/lib/constants";
import { TransactionTypeEnum, CurrencyEnum, CategoryEnum } from "@/types";
import type { Transaction } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface EditTransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

const TYPE_OPTIONS = [
  { value: TransactionTypeEnum.EXPENSE, label: "Expense" },
  { value: TransactionTypeEnum.INCOME, label: "Income" },
];

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS)
  .map(([key, label]) => ({ value: key, label }))
  .sort((a, b) => a.label.localeCompare(b.label));

const dropdownTriggerClass =
  "flex h-auto w-full items-center justify-between border-0 border-b border-border rounded-none bg-transparent px-0 py-2 text-[13px] font-sans text-text-primary focus:border-accent focus:outline-none";
const dropdownContentClass =
  "border-[0.5px] border-border bg-surface rounded-[4px] shadow-[0_8px_24px_rgba(28,20,16,0.08)] p-1 max-h-56 overflow-y-auto";
const dropdownItemClass = (isSelected: boolean) =>
  `cursor-pointer font-sans text-[13px] px-3 py-2 rounded-[4px] transition-colors ${
    isSelected
      ? "bg-bg text-text-primary font-medium"
      : "text-text-secondary hover:bg-bg hover:text-text-primary"
  }`;

function formatDisplayAmount(raw: string): string {
  if (!raw) return "";
  const [intPart, decPart] = raw.split(".");
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
}

function sanitizeDecimalInput(val: string) {
  const cleaned = val.replace(/[^\d.]/g, "");
  if (!cleaned) return "";
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    return `${parts[0]}.${parts.slice(1).join("")}`;
  }
  return cleaned;
}

function parseAmount(val: string) {
  const cleaned = sanitizeDecimalInput(val);
  if (!cleaned) return 0;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function EditTransactionSheet({
  open,
  onOpenChange,
  transaction,
}: EditTransactionSheetProps) {
  const updateTx = useUpdateTransaction();

  const [type, setType] = useState<TransactionTypeEnum>(TransactionTypeEnum.EXPENSE);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [currency, setCurrency] = useState<"IDR" | "USD">("IDR");

  // Populate form whenever a new transaction is passed in
  useEffect(() => {
    if (transaction) {
      setType(
        transaction.type === TransactionTypeEnum.INCOME
          ? TransactionTypeEnum.INCOME
          : TransactionTypeEnum.EXPENSE
      );
      setAmount(String(transaction.amount ?? ""));
      setCategory(transaction.category ?? "");
      setDate(transaction.date ?? "");
      setNote(transaction.note ?? "");
      setCurrency(transaction.currency === "USD" ? "USD" : "IDR");
    }
  }, [transaction]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(sanitizeDecimalInput(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    const parsedAmount = parseAmount(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    updateTx.mutate(
      {
        id: transaction.id,
        data: {
          date,
          amount: String(parsedAmount),
          type,
          category: category as typeof CategoryEnum[keyof typeof CategoryEnum],
          note: note || undefined,
          currency: currency === "USD" ? CurrencyEnum.USD : CurrencyEnum.IDR,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          toast.success("Transaction updated successfully");
        },
        onError: (error: any) => {
          const message = error.response?.data?.detail || error.message || "Failed to update transaction";
          toast.error(message);
        },
      }
    );
  };

  const selectedCategoryLabel = category
    ? CATEGORY_OPTIONS.find((c) => c.value === category)?.label ?? "Select category"
    : "Select category";

  if (!transaction) return null;

  const isTransfer = transaction.type === TransactionTypeEnum.TRANSFER;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[90vh] max-h-[90vh] rounded-t-[8px] px-4 py-6 pb-8 bg-surface border-border flex flex-col overflow-y-auto"
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="font-serif text-xl font-light text-text-primary">
            Edit Transaction
          </SheetTitle>
        </SheetHeader>

        {isTransfer ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="font-sans text-[13px] text-text-secondary text-center max-w-xs">
              Transfers can't be edited directly. Delete this transfer and create a new one instead.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-5">
            {/* ── Type selector ── */}
            <div className="grid grid-cols-2 gap-0 border-[0.5px] border-border rounded-[4px] bg-bg p-0.5">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`py-2 text-[12px] font-sans font-medium rounded-[3px] transition-colors ${
                    type === opt.value
                      ? "bg-accent text-white"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* ── Currency ── */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-semibold text-text-secondary tracking-[0.12em]">
                Currency
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger className={dropdownTriggerClass}>
                  <span>{currency}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-text-secondary" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className={dropdownContentClass}>
                  {["IDR", "USD"].map((c) => (
                    <DropdownMenuItem
                      key={c}
                      onClick={() => setCurrency(c as "IDR" | "USD")}
                      className={dropdownItemClass(currency === c)}
                    >
                      {c}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* ── Amount ── */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-semibold text-text-secondary tracking-[0.12em]">
                Amount ({currency})
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                value={formatDisplayAmount(amount)}
                onChange={handleAmountChange}
                placeholder="0"
                className="h-auto text-center font-mono text-base sm:text-2xl font-normal bg-transparent border-0 border-b border-border rounded-none px-0 py-2 focus:border-accent [&:focus]:ring-0 [&:focus]:ring-offset-0 [&:focus]:outline-none"
              />
            </div>

            {/* ── Category ── */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-semibold text-text-secondary tracking-[0.12em]">
                Category
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger className={dropdownTriggerClass}>
                  <span>{selectedCategoryLabel}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-text-secondary" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className={dropdownContentClass}>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <DropdownMenuItem
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={dropdownItemClass(category === cat.value)}
                    >
                      {cat.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* ── Date ── */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-semibold text-text-secondary tracking-[0.12em]">
                Date
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-auto text-center font-mono text-base sm:text-2xl font-normal bg-transparent border-0 border-b border-border rounded-none px-0 py-2 focus:border-accent [&:focus]:ring-0 [&:focus]:ring-offset-0 [&:focus]:outline-none"
              />
            </div>

            {/* ── Note ── */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-semibold text-text-secondary tracking-[0.12em]">
                Note <span className="font-normal text-text-muted">(optional)</span>
              </Label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., QRIS / Reference"
                className="h-auto text-center font-mono text-base sm:text-2xl font-normal bg-transparent border-0 border-b border-border rounded-none px-0 py-2 focus:border-accent [&:focus]:ring-0 [&:focus]:ring-offset-0 [&:focus]:outline-none"
              />
            </div>

            {/* ── Submit ── */}
            <div className="mt-auto pt-4 border-t-[0.5px] border-dashed border-border">
              <Button
                type="submit"
                disabled={updateTx.isPending || parseAmount(amount) === 0}
                className="w-full bg-accent text-white hover:bg-accent-hover rounded-[4px] py-3 text-sm font-medium"
              >
                {updateTx.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}