// frontend/src/components/transactions/DeleteTransactionDialog.tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionService } from "@/services";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { Transaction } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface DeleteTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

export default function DeleteTransactionDialog({
  open,
  onOpenChange,
  transaction,
}: DeleteTransactionDialogProps) {
  const queryClient = useQueryClient();
  const { formatAmount } = useCurrency();

  const mutation = useMutation({
    mutationFn: () => {
      if (!transaction) throw new Error("No transaction selected");
      return transactionService.delete(transaction.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      onOpenChange(false);
      toast.success("Transaction deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete transaction:", error);
      toast.error(error?.message || "Failed to delete transaction");
    },
  });

  const handleDelete = () => {
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px] shadow-[0_8px_24px_rgba(28,20,16,0.08)] max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg font-light text-[#1C1410]">Delete Transaction</DialogTitle>
          <DialogDescription className="font-sans text-[#8B7355] text-sm">
            Are you sure you want to delete this transaction?
            <br />
            <span className="block mt-1 text-[#1C1410] font-medium">
              {transaction?.note || transaction?.category || "Untitled"} · {formatAmount(Number(transaction?.amount || 0), transaction?.currency ?? "IDR")}
            </span>
            <br />
            {transaction?.type === "TRANSFER" && (
              <span className="text-[#C0392B] text-xs">
                ⚠️ This is a transfer. Both sides of the transfer will be deleted.
              </span>
            )}
            <span className="block mt-2 text-[#C4B5A0] text-xs">
              This action cannot be undone.
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2 border-t-[0.5px] border-[#E8E4DE] pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-[#8B7355] hover:text-[#1C1410] hover:bg-[#FAFAF8] rounded-[4px] text-sm font-sans"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={mutation.isPending}
            className="bg-[#C0392B] text-white hover:bg-[#A83224] rounded-[4px] text-sm font-sans px-4 py-2"
          >
            {mutation.isPending ? "Deleting..." : "Delete Transaction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}