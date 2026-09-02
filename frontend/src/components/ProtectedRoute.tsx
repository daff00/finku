// frontend/src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services';

export default function ProtectedRoute() {
  const { user, isLoading, error } = useAuth();
  const token = authService.getToken();

  // 1. No token at all → redirect immediately
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Still fetching user data → show a minimal loading spinner
  //    (matches your Japanese minimalism – just a subtle pulse)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 3. Token exists but is invalid/expired → clear it and redirect
  if (error || !user) {
    authService.clearToken();
    return <Navigate to="/login" replace />;
  }

  // 4. All good → render the child routes (AppShell → pages)
  return <Outlet />;
}