// frontend/src/components/CashflowStat.tsx
interface CashflowStatProps {
  label: string;
  value: string;
  color?: string; // make optional with fallback
}

export default function CashflowStat({
  label,
  value,
  color = "var(--color-text-primary, #1C1410)",
}: CashflowStatProps) {
  return (
    <div className="bg-surface border-[0.5px] border-border rounded-[4px] p-3 text-center">
      <div className="font-sans text-[9px] font-semibold text-text-secondary mb-1">
        {label}
      </div>
      <div
        className="font-mono text-[13px] font-medium"
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}