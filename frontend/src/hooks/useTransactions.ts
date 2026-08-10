import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionService } from '@/services'
import type { TransactionCreate, TransactionUpdate, TransactionFilters } from '@/types'

// ── Query Keys ────────────────────────────────────────────────────
export const transactionKeys = {
    all: ["transactions"] as const,
    detail: (id: number) => ["transactions", id] as const,
    filtered: (filters: TransactionFilters) => ["transactions", filters] as const,
}

// ── Hooks ─────────────────────────────────────────────────────────
export const useTransactions = () => {
    return useQuery({
        queryKey: transactionKeys.all,
        queryFn: transactionService.getAll,
    })
}