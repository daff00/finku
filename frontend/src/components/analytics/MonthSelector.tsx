// frontend/src/components/analytics/MonthSelector.tsx
import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export default function MonthSelector({ selectedMonth, onMonthChange }: MonthSelectorProps) {
  const monthOptions = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      });
    }
    return months;
  }, []);

  const currentIndex = monthOptions.findIndex((m) => m.value === selectedMonth);
  const currentLabel = monthOptions[currentIndex]?.label || selectedMonth;

  const goPrev = () => {
    if (currentIndex < monthOptions.length - 1) {
      onMonthChange(monthOptions[currentIndex + 1].value);
    }
  };

  const goNext = () => {
    if (currentIndex > 0) {
      onMonthChange(monthOptions[currentIndex - 1].value);
    }
  };

  return (
    <div className="flex items-center justify-center gap-6 py-2 border-b-[0.5px] border-dashed border-[#E8E4DE]">
      <Button
        onClick={goPrev}
        disabled={currentIndex >= monthOptions.length - 1}
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-[#8B7355] hover:text-[#1C1410] disabled:opacity-40"
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center gap-2 font-sans text-[13px] font-medium text-[#1C1410] hover:text-[#C0392B] transition-colors px-2 py-1 rounded-[4px] focus:outline-none"
          aria-label="Select month"
        >
          <span>{currentLabel}</span>
          <ChevronLeft className="h-4 w-4 text-[#8B7355] rotate-[-90deg]" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="center"
          className="w-56 max-h-64 overflow-y-auto bg-white border-[0.5px] border-[#E8E4DE] rounded-[4px] shadow-[0_8px_24px_rgba(28,20,16,0.08)] p-1"
        >
          {monthOptions.map((month) => (
            <DropdownMenuItem
              key={month.value}
              onClick={() => onMonthChange(month.value)}
              className={`cursor-pointer font-sans text-[13px] px-3 py-2 rounded-[4px] transition-colors ${
                month.value === selectedMonth
                  ? "bg-[#FAFAF8] text-[#1C1410] font-medium"
                  : "text-[#8B7355] hover:bg-[#FAFAF8] hover:text-[#1C1410]"
              }`}
            >
              {month.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        onClick={goNext}
        disabled={currentIndex <= 0}
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-[#8B7355] hover:text-[#1C1410] disabled:opacity-40"
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}