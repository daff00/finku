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
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
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

  // ── Reusable input class ──
  const inputClass = `
    h-auto w-full
    !border-0 !border-b !border-border
    !rounded-none
    !bg-transparent
    !px-0 !py-1.5
    !font-sans !text-[13px] !text-text-primary
    !shadow-none
    !outline-none !ring-0 !ring-offset-0
    placeholder:!text-text-muted
    focus:!border-text-primary
    focus:!outline-none
    focus:!ring-0 focus:!ring-offset-0
  `;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border-[0.5px] border-border rounded-[4px] shadow-[0_8px_24px_rgba(28,20,16,0.08)] max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg font-light text-text-primary">Edit Account</DialogTitle>
          <DialogDescription className="font-sans text-text-secondary text-sm">
            Update your account details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] uppercase font-semibold text-text-secondary tracking-[0.12em]">
                Account Name
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            {/* Color */}
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] uppercase font-semibold text-text-secondary tracking-[0.12em]">
                Color
              </Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded-[4px] border-[0.5px] border-border cursor-pointer bg-transparent p-0.5"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className={inputClass}
                  placeholder="#0066AE"
                />
              </div>
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] uppercase font-semibold text-text-secondary tracking-[0.12em]">
                Currency
              </Label>
              <Select value={currency} onValueChange={(value) => setCurrency(value || CurrencyEnum.IDR)}>
                <SelectTrigger className="h-10 rounded-[4px] border-0 border-b border-border bg-transparent px-0 shadow-none font-sans text-sm text-text-primary focus:border-text-primary focus:ring-0 focus:outline-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-[4px] border-[0.5px] border-border bg-surface shadow-[0_8px_24px_rgba(28,20,16,0.08)]">
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
                <Label className="font-sans text-[10px] uppercase font-semibold text-text-secondary tracking-[0.12em]">
                  Parent Account ID
                </Label>
                <Input
                  type="number"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            {/* Is Active — soft delete toggle */}
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] uppercase font-semibold text-text-secondary tracking-[0.12em]">
                Status
              </Label>
              <Select
                value={isActive ? "active" : "inactive"}
                onValueChange={(val) => setIsActive(val === "active")}
              >
                <SelectTrigger className="h-10 rounded-[4px] border-0 border-b border-border bg-transparent px-0 shadow-none font-sans text-sm text-text-primary focus:border-text-primary focus:ring-0 focus:outline-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-[4px] border-[0.5px] border-border bg-surface shadow-[0_8px_24px_rgba(28,20,16,0.08)]">
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

          <DialogFooter className="flex gap-2 border-t-[0.5px] border-border pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-text-secondary hover:text-text-primary hover:bg-bg rounded-[4px] text-sm font-sans"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending || !name.trim()}
              className="bg-accent text-white hover:bg-accent-hover-strong rounded-[4px] text-sm font-sans px-4 py-2"
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}