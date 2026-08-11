import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { balanceService } from '@/services'
import type { BalanceCreate } from '@/types'

// ── Query Keys ────────────────────────────────────────────────────
export const balanceKeys = {
    all: ["balances"] as const,
    latest: (account_id: number) => ["balances", account_id, "latest"] as const,
    byAccount: (account_id: number) => ["balances", account_id] as const,
}

// ── Hooks ─────────────────────────────────────────────────────────
export const useBalance = (account_id?: number) => {
    return useQuery({
        queryKey: account_id
            ? balanceKeys.byAccount(account_id)
            : balanceKeys.all,
        queryFn: () => balanceService.getAll(account_id),
    })
}

export const useLatestBalance = (account_id: number) => {
    return useQuery({
        queryKey: balanceKeys.latest(account_id),
        queryFn: () => balanceService.getLatest(account_id),
        enabled: !!account_id,
    })
}

export const useCreateBalance = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: BalanceCreate) => balanceService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: balanceKeys.all })
        }
    })
}