import api from "@/services/api"
import type { Balance, BalanceCreate } from "@/types"

export const balanceService = {
    getAll: async(account_id?: number): Promise<Balance[]> => {
        const response = await api.get('/balances', {
            params: account_id ? { account_id } : {}
        })
        return response.data
    },
    getLatest: async(account_id: number): Promise<Balance> => {
        const response = await api.get(`/balances/${account_id}/latest`)
        return response.data
    },
    create: async(data: BalanceCreate): Promise<Balance> => {
        const response = await api.post('/balances', data)
        return response.data
    }
}