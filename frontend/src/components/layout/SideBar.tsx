import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Upload,
  Settings,
  Plus,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/import', label: 'Imports', icon: Upload },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleNewTransaction = () => {
    navigate('/transactions');
  };

  const handleLogout = () => {
    logout();
  };

  const userInitial =
    user?.display_name?.charAt(0) ||
    user?.username?.charAt(0) ||
    'U';

  return (
    <aside
      className="
        w-[274px] shrink-0 hidden lg:flex flex-col
        bg-surface h-dvh sticky top-0
        border-r border-border/50
      "
    >
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div className="w-full h-25 px-[27px] pt-[35px] flex items-center justify-start">
        <div className="flex items-center gap-3">
          <div className="size-[33px] bg-accent rounded-sm flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-mono">金</span>
          </div>

          <div>
            <h1 className="text-text-primary text-[22px] font-sans leading-none tracking-wide">
              Finku
            </h1>

            <p className="text-text-muted text-[11px] tracking-[0.15em] leading-none mt-1.5">
              FINANCE · 間
            </p>
          </div>
        </div>
      </div>

      {/* ── Add Transaction ─────────────────────────────────── */}
      <div className="px-[27px] mt-[47px]">
        <Button
          onClick={handleNewTransaction}
          className="
            btn-accent
            w-100%
            h-[55px]
            px-4
            flex items-center justify-center
            gap-2.5
            rounded-[5px]
            text-[16px]
            font-medium
          "
        >
          <Plus size={18} strokeWidth={2} />
          <span>New Transaction</span>
        </Button>
      </div>

      {/* ── Navigation ──────────────────────────────────────── */}
      <nav className="px-[27px] mt-[32px]">
        <p className="label-section px-3 mb-[13px]">
          Menu
        </p>

        <ul className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `
                    h-[48px]
                    w-full
                    flex items-center
                    gap-4
                    px-4
                    rounded-[5px]
                    text-[16px]
                    transition-colors
                    ${
                      isActive
                        ? 'text-accent bg-accent/5'
                        : 'text-text-secondary hover:text-text-primary hover:bg-border/40'
                    }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2 : 1.5}
                      className="shrink-0"
                    />

                    <span
                      className={
                        isActive ? 'font-medium' : 'font-normal'
                      }
                    >
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div className="mt-auto border-t border-border/50 px-[27px] py-4">
        {user ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="
                  size-8 shrink-0
                  rounded-full
                  bg-accent/10
                  text-accent
                  flex items-center justify-center
                  text-xs font-medium
                "
              >
                {userInitial}
              </div>

              <span className="text-[15px] text-text-primary truncate">
                {user.display_name || user.username}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="
                shrink-0
                p-1.5
                text-text-muted
                hover:text-accent
                transition-colors
                rounded-sm
                hover:bg-border/30
              "
              title="Logout"
            >
              <LogOut size={17} strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-text-muted text-sm">
            <UserIcon size={14} />
            <span>Loading...</span>
          </div>
        )}

        <p className="text-[9px] text-text-muted/60 text-center tracking-wide mt-3">
          間 · Negative space
        </p>
      </div>
    </aside>
  );
}