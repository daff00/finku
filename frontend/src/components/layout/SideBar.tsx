// frontend/src/components/layout/Sidebar.tsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDarkMode } from "@/hooks/useDarkMode";
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Upload,
  Settings,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  User as UserIcon,
  Moon,
  Sun
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onAddTransaction: () => void; // new prop
}

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/import", label: "Import", icon: Upload },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ onAddTransaction }: SidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggle } = useDarkMode();
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => setCollapsed((prev) => !prev);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const userInitial =
    user?.display_name?.charAt(0) ||
    user?.username?.charAt(0) ||
    "U";

  return (
    <aside
      className={cn(
        "shrink-0 hidden lg:flex flex-col bg-surface h-dvh sticky top-0 border-r border-border/50 transition-all duration-300 ease-in-out",
        collapsed ? "w-[64px]" : "w-[220px]"
      )}
    >
      {/* ── Logo + Collapse Toggle ────────────────────────────── */}
      <div
        className={cn(
          "flex items-center border-b border-border/50 h-14",
          collapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 bg-accent rounded-sm flex items-center justify-center">
              <span className="text-white text-[10px] font-mono">金</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-light tracking-tight text-text-primary">
                Finku
              </span>
              <span className="text-[8px] uppercase tracking-[0.15em] text-text-muted">
                FINANCE · 間
              </span>
            </div>
          </div>
        )}
        <Button
          onClick={toggleCollapse}
          className="p-2 rounded-[4px] transition-colors text-text-muted hover:text-text-primary hover:bg-border/40"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen size={16} strokeWidth={1.5} />
          ) : (
            <PanelLeftClose size={16} strokeWidth={1.5} />
          )}
        </Button>
      </div>

      {/* ── Add Transaction Button ────────────────────────────── */}
      <div
        className={cn(
          "border-b border-border/50 py-3",
          collapsed ? "flex justify-center px-2" : "px-4"
        )}
      >
        {collapsed ? (
          <button
            onClick={onAddTransaction}
            className="p-2 rounded-[4px] bg-accent text-white hover:bg-accent-hover transition-colors"
            aria-label="New Transaction"
            title="New Transaction"
          >
            <Plus size={16} strokeWidth={2} />
          </button>
        ) : (
          <button
            onClick={onAddTransaction}
            className="w-full btn-accent flex items-center justify-center gap-2 py-2.5 text-[13px]"
          >
            <Plus size={14} strokeWidth={2} />
            <span>New Transaction</span>
          </button>
        )}
      </div>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <p className="label-section px-3 mb-4 text-[9px] font-sans uppercase tracking-[0.12em] text-text-secondary">
            Menu
          </p>
        )}
        <ul className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-[4px] text-[13px] transition-colors cursor-pointer",
                    collapsed
                      ? "justify-center px-2 !py-0 h-10"
                      : "gap-3 !py-2 !px-3",
                    isActive
                      ? "text-accent bg-accent/5"
                      : "text-text-secondary hover:text-text-primary hover:bg-border/40"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {!collapsed && (
                      <span
                        className={cn(
                          "shrink-0 w-[3px] h-4 rounded-sm transition-colors",
                          isActive ? "bg-accent" : "bg-transparent"
                        )}
                      />
                    )}
                    <Icon
                      size={18}
                      strokeWidth={isActive ? 2 : 1.5}
                      className="shrink-0"
                    />
                    {!collapsed && (
                      <span
                        className={cn(
                          "whitespace-nowrap transition-opacity duration-200",
                          isActive ? "font-medium" : "font-normal"
                        )}
                      >
                        {label}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Button
        onClick={toggle}
        className="p-2 rounded-[4px] transition-colors text-text-muted hover:text-text-primary hover:bg-border/40"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
      </Button>

      {/* ── User + Logout ────────────────────────────────────── */}
      <div className="border-t border-border/50 px-3 py-3">
        {user ? (
          <div
            className={cn(
              "flex items-center",
              collapsed ? "justify-center" : "justify-between gap-2"
            )}
          >
            {!collapsed && (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {userInitial}
                </div>
                <span className="text-[13px] text-text-primary truncate">
                  {user.display_name || user.username}
                </span>
              </div>
            )}
            <Button
              onClick={handleLogout}
              className="p-1.5 text-text-muted hover:text-accent transition-colors rounded-sm hover:bg-border/30"
              title="Logout"
            >
              <LogOut size={16} strokeWidth={1.5} />
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "flex items-center text-text-muted text-sm",
              collapsed ? "justify-center" : "gap-2"
            )}
          >
            {!collapsed && <UserIcon size={16} />}
            {!collapsed && <span>Loading…</span>}
          </div>
        )}
      </div>
    </aside>
  );
}