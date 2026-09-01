import type { User } from "@/types";

export default function UserAvatar({ user }: { user: User | null }) {
  const initial = user?.display_name?.charAt(0) || user?.username?.charAt(0) || "F";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b-[0.5px] border-dashed border-[#E8E4DE]">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 shrink-0 rounded-[2px] bg-accent/10 text-accent flex items-center justify-center font-sans text-[15px]">
          {initial}
        </div>
        <div className="min-w-0">
          <div className="font-sans text-sm font-medium text-[#1C1410] truncate">
            {user?.display_name || user?.username || "Finku User"}
          </div>
          <div className="font-sans text-xs text-[#8B7355] truncate">
            @{user?.username || "user"}
          </div>
        </div>
      </div>
    </div>
  );
}