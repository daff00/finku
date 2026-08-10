import api from '@/services/api'
import type { Account, AccountCreate, AccountUpdate, Transaction } from '@/types'

export const accountService = {
    getAll: async(): Promise<Account[]> => {
        const response = await api.get('/accounts')
        return response.data
    },
    getById: async(id: number): Promise<Account> => {
        const response = await api.get(`/accounts/${id}`)
        return response.data
    },
    getTransactions: async(id: number): Promise<Transaction[]> => {
        const response = await api.get(`/accounts/${id}/transactions`)
        return response.data
    },
    create: async(data: AccountCreate): Promise<Account> => {
        const response = await api.post(`/accounts`, data)
        return response.data
    },
    update: async(id: number, data: AccountUpdate): Promise<Account> => {
        const response = await api.patch(`/accounts/${id}`, data)
        return response.data
    },
    delete: async(id: number): Promise<void> => {
        await api.delete(`/accounts/${id}`)
    }
}