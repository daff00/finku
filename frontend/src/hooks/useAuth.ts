import { useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services'
import type { User } from '@/types'

export function useAuth() {
  const queryClient = useQueryClient()
  const hasToken = authService.isAuthenticated()

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const logout = () => {
    // Hapus token
    authService.clearToken()

    // Hapus cache user tanpa refetch
    queryClient.removeQueries({
      queryKey: ['auth', 'me'],
    })
  }

  return {
    user,
    isLoading: hasToken ? isLoading : false,
    error: hasToken ? error : null,
    logout,
  }
}