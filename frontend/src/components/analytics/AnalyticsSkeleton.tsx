// frontend/src/components/analytics/AnalyticsSkeleton.tsx
export default function AnalyticsSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      <div className="h-6 w-32 bg-[#E8E4DE]/60 rounded" />
      <div className="h-8 border-b border-dashed border-[#E8E4DE]" />
      <div className="h-56 bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px]" />
      <div className="h-24 bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px]" />
      <div className="h-48 bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px]" />
    </div>
  );
}