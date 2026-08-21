import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  BarChart3, 
  Upload, 
  Settings,
  Plus,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { to: '/analytics', label: 'Analisis', icon: BarChart3 },
  { to: '/import', label: 'Impor Pernyataan', icon: Upload },
  { to: '/settings', label: 'Pengaturan', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-surface border-r border-border h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto hidden lg:flex flex-col">
      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1">
        {/* Section label */}
        <p className="text-[10px] uppercase tracking-[0.15em] text-text-muted px-3 mb-3">
          NAVIGASI
        </p>
        
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => // ← isActive is destructured from the props
              `flex items-center gap-3 px-3 py-2.5 rounded-[4px] text-sm transition-colors ${
                isActive
                  ? 'bg-accent/5 text-accent font-medium'
                  : 'text-text-secondary hover:bg-border/30 hover:text-text-primary'
              }`
            }
          >
            {/* Active indicator – small square instead of left border */}
            {({ isActive }) => ( // ← This is the problem! Remove this nested function
              <>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-sm bg-accent shrink-0" />
                )}
                {!isActive && (
                  <span className="w-1.5 h-1.5 rounded-sm bg-transparent shrink-0" />
                )}
                <Icon size={18} strokeWidth={1.5} />
                <span className="font-sans">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: New Transaction Button */}
      <div className="p-4 border-t border-border">
        <button className="w-full btn-accent flex items-center justify-center gap-2 py-2.5">
          <Plus size={16} strokeWidth={2} />
          <span className="text-sm font-sans">+ Transaksi Baru</span>
        </button>
      </div>
    </aside>
  );
}