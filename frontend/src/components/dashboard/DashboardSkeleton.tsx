// frontend/src/components/dashboard/DashboardSkeleton.tsx
export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      <div className="space-y-2">
        <div className="h-5 w-40 bg-border/50 rounded" />
        <div className="h-4 w-52 bg-border/40 rounded" />
      </div>

      <div className="space-y-8">
        <div className="h-32 bg-border/40 rounded-[4px]" />

        <div className="h-px bg-border/40" />

        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-border/40 rounded-[4px]" />
          ))}
        </div>

        <div className="h-px bg-border/40" />

        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-border/40 rounded" />
        ))}

        <div className="h-[420px] bg-border/40 rounded-[4px]" />
      </div>
    </div>
  );
}