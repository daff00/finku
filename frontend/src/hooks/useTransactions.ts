import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionService } from '@/services'
import type { TransactionCreate, TransactionUpdate, TransactionFilters, TransferCreate } from '@/types'
import { analyticsKeys } from './useAnalytics' // adjust path to match your actual file

// ── Query Keys ────────────────────────────────────────────────────
export const transactionKeys = {
    all: ["transactions"] as const,
    detail: (id: number) => ["transactions", id] as const,
    filtered: (filters: TransactionFilters) => ["transactions", filters] as const,
}

// ── Shared invalidation helper ──────────────────────────────────────
// Anything that changes transactions also affects derived analytics data.
function invalidateTransactionDependents(queryClient: ReturnType<typeof useQueryClient>) {
    queryClient.invalidateQueries({ queryKey: transactionKeys.all })
    queryClient.invalidateQueries({ queryKey: ["accounts"] })
    queryClient.invalidateQueries({ queryKey: analyticsKeys.networth })
    // These keys are parameterized (month), so invalidate by prefix to catch all cached months
    queryClient.invalidateQueries({ queryKey: ["analytics", "monthly"] })
    queryClient.invalidateQueries({ queryKey: ["analytics", "categories"] })
    queryClient.invalidateQueries({ queryKey: ["analytics", "accounts"] }) // spendingByAccount
}

// ── Hooks ─────────────────────────────────────────────────────────
export const useTransactions = (filters?: TransactionFilters) => {
    return useQuery({
        queryKey: filters 
            ? transactionKeys.filtered(filters) 
            : transactionKeys.all,
        queryFn: () => transactionService.getAll(filters),
    })
}

export const useTransaction = (id: number) => {
    return useQuery({
        queryKey: transactionKeys.detail(id),
        queryFn: () => transactionService.getById(id),
        enabled: !!id,
    })
}

export const useCreateTransaction = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: TransactionCreate) => transactionService.create(data),
        onSuccess: () => invalidateTransactionDependents(queryClient),
    })
}

export const useUpdateTransaction = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: TransactionUpdate }) =>
            transactionService.update(id, data),
        onSuccess: (_, { id }) => {
            invalidateTransactionDependents(queryClient)
            queryClient.invalidateQueries({ queryKey: transactionKeys.detail(id) })
        },
    })
}

export const useDeleteTransaction = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => transactionService.delete(id),
        onSuccess: () => invalidateTransactionDependents(queryClient),
    })
}

export const useCreateTransfer = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: TransferCreate) => 
            transactionService.createTransfer(data),
        onSuccess: () => invalidateTransactionDependents(queryClient),
    })
}