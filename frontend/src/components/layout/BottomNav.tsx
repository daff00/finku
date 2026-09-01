// frontend/src/components/layout/BottomNav.tsx
import { NavLink } from "react-router-dom";
import { Plus } from "lucide-react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Upload,
  Settings,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/import", label: "Import", icon: Upload },
  { to: "/settings", label: "Settings", icon: Settings },
];

interface BottomNavProps {
  onAddTransaction: () => void;
}

export default function BottomNav({ onAddTransaction }: BottomNavProps) {
  return (
    <>
      {/* Floating Action Button — positioned above the bottom nav */}
      <button
        onClick={onAddTransaction}
        className="lg:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-20 
          flex h-12 w-12 items-center justify-center 
          rounded-full bg-accent text-white shadow-lg 
          hover:bg-accent-hover transition-colors"
        aria-label="New Transaction"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      {/* Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border flex items-center justify-around px-2 z-10">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <div
                className={`flex flex-col items-center justify-center transition-colors ${
                  isActive ? "text-accent" : "text-text-muted"
                }`}
              >
                <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2 : 1.5} />
                {isActive && (
                  <span className="text-[10px] mt-0.5 font-medium">{label}</span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}