import type { Account } from "@/types";
import { formatIDR } from "@/lib/formatters";
import { BANK_LABELS, BANK_COLORS } from "@/lib/constants";

type Props = {
  account: Account;
  balance: string;
};

export default function AccountCard({ account, balance }: Props) {
  const bankColor = BANK_COLORS[account.bank] || "#8B7355";
  const bankLabel = BANK_LABELS[account.bank] || account.bank;

  return (
    <div
      className="
        bg-white
        border-[0.5px]
        border-[#E8E4DE]
        rounded-[4px]
        p-4
      "
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: bankColor,
      }}
    >
      <p className="text-[13px] text-[#1C1410] font-sans">
        {account.name}
      </p>

      <p className="text-[10px] text-[#8B7355] font-sans mt-0.5">
        {bankLabel} · {account.type}
      </p>

      <p className="font-mono text-[15px] text-[#1C1410] mt-3">
        {formatIDR(balance)}
      </p>
    </div>
  );
}