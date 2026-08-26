import { useMutation, useQueryClient } from "@tanstack/react-query";
import { accountService } from "@/services";
import type { Account } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
}

export default function DeleteAccountDialog({
  open,
  onOpenChange,
  account,
}: DeleteAccountDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      if (!account) throw new Error("No account selected");
      // Soft delete: set is_active to false
      return accountService.update(account.id, {
        is_active: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      console.error("Failed to deactivate account:", error);
      alert(`Failed to deactivate account: ${error.message}`);
    },
  });

  const handleDelete = () => {
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px] shadow-[0_8px_24px_rgba(28,20,16,0.08)] max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg font-light text-[#1C1410]">Deactivate Account</DialogTitle>
          <DialogDescription className="font-sans text-[#8B7355] text-sm">
            Are you sure you want to deactivate <strong className="text-[#1C1410]">{account?.name}</strong>?
            <br />
            This account will be marked as inactive. You can reactivate it later by editing the account.
            <br />
            <br />
            <span className="text-[#C4B5A0]">All associated transactions will be preserved.</span>
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
            {mutation.isPending ? "Deactivating..." : "Deactivate Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}