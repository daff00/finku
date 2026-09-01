import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { accountService } from '@/services'
import type { AccountCreate, AccountUpdate } from '@/types'

// ── Query Keys ────────────────────────────────────────────────────
export const accountKeys = {
    all: ["accounts"] as const,
    detail: (id: number) => ["accounts", id] as const,
    transactions: (id: number) => ["accounts", id, "transactions"] as const,
}

// ── Hooks ─────────────────────────────────────────────────────────
export function useAccounts(params?: { include_inactive?: boolean }) {
  return useQuery({
    queryKey: ["accounts", params],
    queryFn: () => accountService.getAll(params),
  });
}

export const useAccount = (id: number) => {
    return useQuery({
        queryKey: accountKeys.detail(id),
        queryFn: () => accountService.getById(id),
        enabled: !!id,  // only fetch if id exists
    })
}

export const useAccountTransactions = (id: number) => {
    return useQuery({
        queryKey: accountKeys.transactions(id),
        queryFn: () => accountService.getTransactions(id),
        enabled: !!id,
    })
}

export const useCreateAccount = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: AccountCreate) => accountService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: accountKeys.all })
        },
    })
}

export const useUpdateAccount = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: AccountUpdate }) =>
            accountService.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: accountKeys.all })
            queryClient.invalidateQueries({ queryKey: accountKeys.detail(id) })
        },
    })
}

export const useDeleteAccount = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => accountService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: accountKeys.all })
        },
    })
}