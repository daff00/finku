type CashflowStatProps = {
  label: string;
  value: string;
  color: string;
};

export default function CashflowStat({
  label,
  value,
  color,
}: CashflowStatProps) {
  return (
    <div className="bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px] p-3 text-center">
      <div className="font-inter text-[9px] font-semibold text-[#8B7355] mb-1">
        {label}
      </div>

      <div
        className="font-mono-num text-[13px] font-medium"
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}