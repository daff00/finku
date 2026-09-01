// frontend/src/components/transactions/TransactionEmptyState.tsx
export default function TransactionEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <span className="font-mono text-5xl text-text-muted/30">録</span>
      <p className="mt-3 text-center font-sans text-[13px] text-text-muted">
        No matching transactions
      </p>
    </div>
  );
}