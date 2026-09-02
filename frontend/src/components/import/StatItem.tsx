// frontend/src/components/import/StatItem.tsx
interface StatItemProps {
  label: string;
  value: number;
  color: string;
}

export default function StatItem({ label, value, color }: StatItemProps) {
  return (
    <div className="min-w-0 rounded-[4px] border-[0.5px] border-border bg-bg px-2 py-3 text-center">
      <p className="truncate font-sans text-[8px] font-medium uppercase tracking-[0.1em] text-text-secondary">
        {label}
      </p>
      <p className={`mt-1 truncate font-mono text-[16px] font-medium leading-none ${color}`}>
        {value.toLocaleString("en-US")}
      </p>
    </div>
  );
}