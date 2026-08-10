import api from '@/services/api'
import type { Transaction, TransactionCreate, TransactionFilters, TransactionUpdate, TransferCreate } from '@/types'

export const transactionService = {
    getAll: async(filters?: TransactionFilters): Promise<Transaction[]> => {
        const response = await api.get('/transactions', { params: filters })
        return response.data
    },
    getById: async(id: number): Promise<Transaction> => {
        const response = await api.get(`/transactions/${id}`)
        return response.data
    },
    create: async(data: TransactionCreate): Promise<Transaction> => {
        const response = await api.post('/transactions', data)
        return response.data
    },
    update: async(id: number, data: TransactionUpdate): Promise<Transaction> => {
        const response = await api.patch(`/transactions/${id}`, data)
        return response.data
    },
    delete: async(id:number): Promise<void> => {
        await api.delete(`/transactions/${id}`)
    },
    createTransfer: async(data: TransferCreate): Promise<Transaction> => {
        const response = await api.post('/transactions/transfer', data)
        return response.data
    }
}