// frontend/src/components/import/ImportSkeleton.tsx
export default function ImportSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      <div>
        <div className="h-8 w-24 bg-border/60 rounded" />
        <div className="h-4 w-48 bg-border/40 rounded mt-2" />
      </div>

      <div className="rounded-[4px] !ring-0 bg-surface">
        <div className="border-b-[0.5px] border-dashed border-border px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-[3px] bg-border/60" />
            <div>
              <div className="h-4 w-32 bg-border/60 rounded" />
              <div className="h-3 w-48 bg-border/40 rounded mt-1" />
            </div>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6 space-y-5">
          <div className="space-y-1.5">
            <div className="h-3 w-32 bg-border/60 rounded" />
            <div className="h-10 w-full rounded-[4px] bg-border/40" />
          </div>

          <div className="space-y-1.5">
            <div className="h-3 w-20 bg-border/60 rounded" />
            <div className="h-10 w-full rounded-[4px] bg-border/40" />
          </div>

          <div className="space-y-1.5">
            <div className="h-3 w-28 bg-border/60 rounded" />
            <div className="h-32 w-full rounded-[4px] bg-border/40" />
          </div>

          <div className="h-10 w-36 rounded-[4px] bg-border/40" />
        </div>
      </div>
    </div>
  );
}