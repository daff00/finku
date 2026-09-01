// frontend/src/components/transactions/TransactionSkeleton.tsx
export default function TransactionSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between border-b-[0.5px] border-dashed border-border py-[14px]"
        >
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-[7px] h-[4px] w-[4px] rounded-full bg-border" />
            <div className="space-y-2">
              <div className="h-3.5 w-32 animate-pulse rounded bg-border/60" />
              <div className="h-2.5 w-44 animate-pulse rounded bg-border/40" />
            </div>
          </div>
          <div className="h-3.5 w-20 animate-pulse rounded bg-border/60" />
        </div>
      ))}
    </div>
  );
}