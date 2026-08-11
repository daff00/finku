import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionService } from '@/services'
import type { TransactionCreate, TransactionUpdate, TransactionFilters, TransferCreate } from '@/types'

// ── Query Keys ────────────────────────────────────────────────────
export const transactionKeys = {
    all: ["transactions"] as const,
    detail: (id: number) => ["transactions", id] as const,
    filtered: (filters: TransactionFilters) => ["transactions", filters] as const,
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
        enabled: !!id,  // only fetch if id exists
    })
}

export const useCreateTransaction = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: TransactionCreate) => transactionService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: transactionKeys.all })
            queryClient.invalidateQueries({ queryKey: ["accounts"]})
        },
    })
}

export const useUpdateTransaction = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: TransactionUpdate }) =>
            transactionService.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: transactionKeys.all })
            queryClient.invalidateQueries({ queryKey: transactionKeys.detail(id) })
        },
    })
}

export const useDeleteTransaction = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => transactionService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: transactionKeys.all })
        },
    })
}

export const useCreateTransfer = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: TransferCreate) => 
            transactionService.createTransfer(data),
        onSuccess: () => {
            // refresh transactions — new transfer rows added
            queryClient.invalidateQueries({ queryKey: transactionKeys.all })
            // refresh accounts — balances changed after transfer
            queryClient.invalidateQueries({ queryKey: ["accounts"] })
        },
    })
}