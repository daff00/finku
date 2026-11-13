// frontend/src/components/layout/AppShell.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./SideBar";
import BottomNav from "./BottomNav";
import AddTransactionSheet from "@/components/transactions/AddTransactionSheet";
import CurrencyToggle from "@/components/CurrencyToggle";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export default function AppShell() {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const { isDark, toggle } = useDarkMode();

  const openAddSheet = () => setIsAddSheetOpen(true);
  const closeAddSheet = () => setIsAddSheetOpen(false);

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="flex flex-1">
        <Sidebar onAddTransaction={openAddSheet} />
        <main className="flex-1 p-6 pb-24 lg:pb-6 overflow-auto">
          <div className="flex justify-end gap-2 mb-6">
            <CurrencyToggle />
            <Button
              onClick={toggle}
              className="p-2 rounded-[4px] transition-colors text-text-muted hover:text-text-primary hover:bg-border/40"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
            </Button>
          </div>
          <Outlet />
        </main>
      </div>
      <BottomNav onAddTransaction={openAddSheet} />
      <AddTransactionSheet open={isAddSheetOpen} onOpenChange={closeAddSheet} />
    </div>
  );
}