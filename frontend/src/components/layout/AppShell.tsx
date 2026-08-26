// frontend/src/components/layout/AppShell.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./SideBar";
import BottomNav from "./BottomNav";
import AddTransactionSheet from "@/components/transactions/AddTransactionSheet";

export default function AppShell() {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  const openAddSheet = () => setIsAddSheetOpen(true);
  const closeAddSheet = () => setIsAddSheetOpen(false);

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="flex flex-1">
        <Sidebar onAddTransaction={openAddSheet} />
        <main className="flex-1 p-6 pb-24 lg:pb-6 overflow-auto">
          <Outlet />
        </main>
      </div>
      <BottomNav onAddTransaction={openAddSheet} />
      <AddTransactionSheet open={isAddSheetOpen} onOpenChange={closeAddSheet} />
    </div>
  );
}