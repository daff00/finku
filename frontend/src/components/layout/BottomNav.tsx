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
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/transactions', label: 'Txns', icon: ArrowLeftRight },
  { to: '/analytics', label: 'Stats', icon: BarChart3 },
  { to: '/import', label: 'Import', icon: Upload },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border flex items-center justify-around px-2 z-10">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 text-[10px] transition-colors ${
              isActive ? 'text-accent' : 'text-text-muted'
            }`
          }
        >
          <Icon size={20} strokeWidth={1.5} />
          <span>{label}</span>
        </NavLink>
      ))}
      
      {/* Floating action button for mobile */}
      <button className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white rounded-full p-3 shadow-lg">
        <Plus size={20} strokeWidth={2} />
      </button>
    </nav>
  );
}