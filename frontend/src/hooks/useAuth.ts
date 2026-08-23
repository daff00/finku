import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services';
import type { User } from '@/types';

export function useAuth() {
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Logout – clear token and invalidate user query
  const logout = () => {
    localStorage.removeItem('token');
    queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    // Redirect to login will be handled by ProtectedRoute
  };

  return { user, isLoading, error, logout };
}