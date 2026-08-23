import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/SideBar';
import BottomNav from '@/components/layout/BottomNav';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 pb-24 lg:pb-6 overflow-auto">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}