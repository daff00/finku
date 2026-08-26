// frontend/src/components/import/BankDisplay.tsx
import { BANK_LABELS } from "@/lib/constants";

interface BankDisplayProps {
  bank: string | null;
}

export default function BankDisplay({ bank }: BankDisplayProps) {
  return (
    <div className="space-y-1.5">
      <label className="block font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B7355]">
        Bank
      </label>
      <div className="flex min-h-10 items-center rounded-[4px] border-[0.5px] border-[#E8E4DE] bg-[#FAFAF8] px-3 font-sans text-[12px] text-[#1C1410]">
        {bank ? BANK_LABELS[bank] ?? bank : "Select an account"}
      </div>
    </div>
  );
}