// frontend/src/components/dashboard/GreetingSection.tsx
import type { User } from "@/types";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "おはよう";
  if (hour >= 12 && hour < 17) return "こんにちは";
  if (hour >= 17 && hour < 21) return "こんばんは";
  return "おやすみ";
}

interface GreetingSectionProps {
  user: User | null;
}

export default function GreetingSection({ user }: GreetingSectionProps) {
  const displayName = user?.display_name || user?.username || "Guest";
  const greeting = getGreeting();

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-sans text-[15px] sm:text-[16px] font-medium text-text-secondary-strong">
          {greeting}, {displayName}
        </p>
        <p className="font-sans text-[12px] sm:text-[13px] font-medium text-text-secondary mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}