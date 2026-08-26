import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CurrencyEnum } from "@/types";
import { accountService } from "@/services";
import type { Account } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
}

export default function EditAccountDialog({ open, onOpenChange, account }: EditAccountDialogProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [currency, setCurrency] = useState<string>(CurrencyEnum.IDR);
  const [parentId, setParentId] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    if (account) {
      setName(account.name);
      setColor(account.color || "#0066AE");
      setCurrency(account.currency || CurrencyEnum.IDR);
      setParentId(account.parent_id?.toString() || "");
      setIsActive(account.is_active !== false);
    }
  }, [account]);

  const mutation = useMutation({
    mutationFn: () =>
      accountService.update(account!.id, {
        name,
        color,
        currency: currency as any,
        parent_id: parentId ? Number(parentId) : undefined,
        is_active: isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Failed to update account:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const hasParentId = account?.parent_id && account.parent_id > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px] shadow-[0_8px_24px_rgba(28,20,16,0.08)] max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg font-light text-[#1C1410]">Edit Account</DialogTitle>
          <DialogDescription className="font-sans text-[#8B7355] text-sm">
            Update your account details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] uppercase font-semibold text-[#8B7355] tracking-[0.12em]">
                Account Name
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-auto rounded-none border-0 border-b border-[#E8E4DE] px-0 py-1 shadow-none bg-transparent text-[#1C1410] font-sans text-sm focus:border-[#1C1410] focus:ring-0 focus:outline-none"
                required
              />
            </div>

            {/* Color */}
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] uppercase font-semibold text-[#8B7355] tracking-[0.12em]">
                Color
              </Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded-[4px] border-[0.5px] border-[#E8E4DE] cursor-pointer bg-transparent p-0.5"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 h-auto rounded-none border-0 border-b border-[#E8E4DE] px-0 py-1 shadow-none bg-transparent text-[#1C1410] font-mono text-sm focus:border-[#1C1410] focus:ring-0 focus:outline-none"
                  placeholder="#0066AE"
                />
              </div>
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] uppercase font-semibold text-[#8B7355] tracking-[0.12em]">
                Currency
              </Label>
              <Select value={currency} onValueChange={(value) => setCurrency(value || CurrencyEnum.IDR)}>
                <SelectTrigger className="h-10 rounded-[4px] border-0 border-b border-[#E8E4DE] bg-transparent px-0 shadow-none font-sans text-sm text-[#1C1410] focus:border-[#1C1410] focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-[4px] border-[0.5px] border-[#E8E4DE] bg-white shadow-[0_8px_24px_rgba(28,20,16,0.08)]">
                  {Object.values(CurrencyEnum).map((curr) => (
                    <SelectItem key={curr} value={curr} className="font-sans text-sm">
                      {curr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Parent ID — only show if account has one */}
            {hasParentId && (
              <div className="space-y-1.5">
                <Label className="font-sans text-[10px] uppercase font-semibold text-[#8B7355] tracking-[0.12em]">
                  Parent Account ID
                </Label>
                <Input
                  type="number"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="h-auto rounded-none border-0 border-b border-[#E8E4DE] px-0 py-1 shadow-none bg-transparent text-[#1C1410] font-sans text-sm focus:border-[#1C1410] focus:ring-0 focus:outline-none"
                />
              </div>
            )}

            {/* Is Active — soft delete toggle */}
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] uppercase font-semibold text-[#8B7355] tracking-[0.12em]">
                Status
              </Label>
              <Select
                value={isActive ? "active" : "inactive"}
                onValueChange={(val) => setIsActive(val === "active")}
              >
                <SelectTrigger className="h-10 rounded-[4px] border-0 border-b border-[#E8E4DE] bg-transparent px-0 shadow-none font-sans text-sm text-[#1C1410] focus:border-[#1C1410] focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-[4px] border-[0.5px] border-[#E8E4DE] bg-white shadow-[0_8px_24px_rgba(28,20,16,0.08)]">
                  <SelectItem value="active" className="font-sans text-sm">
                    Active
                  </SelectItem>
                  <SelectItem value="inactive" className="font-sans text-sm">
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
              type="submit"
              disabled={mutation.isPending || !name.trim()}
              className="bg-[#C0392B] text-white hover:bg-[#A83224] rounded-[4px] text-sm font-sans px-4 py-2"
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}