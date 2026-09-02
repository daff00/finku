// frontend/src/components/import/BankDisplay.tsx
import { BANK_LABELS } from "@/lib/constants";

interface BankDisplayProps {
  bank: string | null;
}

export default function BankDisplay({ bank }: BankDisplayProps) {
  return (
    <div className="space-y-1.5">
      <label className="block font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
        Bank
      </label>
      <div className="flex min-h-10 items-center rounded-[4px] border-[0.5px] border-border bg-bg px-3 font-sans text-[12px] text-text-primary">
        {bank ? BANK_LABELS[bank] ?? bank : "Select an account"}
      </div>
    </div>
  );
}