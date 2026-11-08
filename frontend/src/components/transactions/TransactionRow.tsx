// frontend/src/components/transactions/TransactionRow.tsx
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/constants";
import { useCurrency } from "@/contexts/CurrencyContext";
import { TransactionTypeEnum } from "@/types";
import type { Transaction } from "@/types";
import DeleteTransactionDialog from "./DeleteTransactionDialog";
import EditTransactionSheet from "./EditTransactionSheet";

type AccountInfo = {
  name: string;
  bank: string;
  color: string;
};

function getTransactionAmountStyle(type: Transaction["type"]) {
  switch (type) {
    case TransactionTypeEnum.INCOME:
      return { color: "text-income", prefix: "+" };
    case TransactionTypeEnum.EXPENSE:
      return { color: "text-expense", prefix: "-" };
    case TransactionTypeEnum.TRANSFER:
      return { color: "text-text-secondary", prefix: "↔ " };
    default:
      return { color: "text-text-primary", prefix: "" };
  }
}

interface TransactionRowProps {
  tx: Transaction;
  account?: AccountInfo;
}

export default function TransactionRow({ tx, account }: TransactionRowProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const { formatAmount } = useCurrency();

  const bankColor = account?.color ?? "var(--color-bank-other)";
  const categoryLabel = CATEGORY_LABELS[tx.category] ?? tx.category;
  const { color: amountColor, prefix: amountPrefix } = getTransactionAmountStyle(tx.type);

  return (
    <>
      <div className="flex items-center justify-between border-b-[0.5px] border-dashed border-border py-[14px] group">
        <div className="flex min-w-0 items-start gap-3 pr-2">
          <div
            className="mt-[7px] h-[4px] w-[4px] shrink-0 rounded-full"
            style={{ backgroundColor: bankColor }}
            title={account?.bank ?? ""}
          />
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-sans text-[14px] font-normal leading-tight text-text-primary">
              {tx.note || categoryLabel}
            </span>
            <div className="mt-1 flex items-center gap-2">
              {account && (
                <span className="font-sans text-[10px] text-text-secondary">
                  {account.bank || account.name}
                </span>
              )}
              {categoryLabel && (
                <span className="hidden font-sans text-[10px] text-text-muted sm:inline">
                  • {categoryLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className={`font-mono text-[14px] font-medium ${amountColor}`}>
              {amountPrefix}
              {formatAmount(Number(tx.amount), tx.currency ?? "IDR")}
            </div>
          </div>

          {/* Edit + Delete buttons — appear on hover */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditSheetOpen(true)}
              className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-[4px]"
              title="Edit transaction"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="p-1.5 text-text-muted hover:text-expense hover:bg-expense-subtle rounded-[4px]"
              title="Delete transaction"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <EditTransactionSheet
        open={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
        transaction={tx}
      />

      <DeleteTransactionDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        transaction={tx}
      />
    </>
  );
}