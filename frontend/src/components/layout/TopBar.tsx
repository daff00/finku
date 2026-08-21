import { useAuth } from '@/hooks/useAuth';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 px-6 border-b border-border flex items-center justify-between bg-surface">
      {/* Left: Logo + subtitle */}
      <div className="flex items-center gap-2">
        <div className="size-8 bg-accent rounded-sm flex items-center justify-center">
          <span className="text-white text-sm font-mono">金</span>
        </div>
        <div>
          <h1 className="text-text-primary text-sm font-sans tracking-wide">Finku</h1>
          <p className="text-text-muted text-[10px] tracking-[0.15em] leading-none">
            FINANCE · 間
          </p>
        </div>
      </div>

      {/* Right: User info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <UserIcon size={14} className="text-text-muted" />
          <span className="text-text-secondary text-sm">
            {user?.display_name || user?.username}
          </span>
        </div>
        <button
          onClick={logout}
          className="p-1.5 rounded hover:bg-border/50 transition-colors"
          aria-label="Logout"
        >
          <LogOut size={16} className="text-text-muted" />
        </button>
      </div>
    </header>
  );
}