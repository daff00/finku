import api from "@/services/api"
import type { Networth, MonthlySummary, CategoryBreakdown, AccountBalance } from "@/types"

export const analyticsService = {
    getNetworth: async(): Promise<Networth> => {
        const response = await api.get('/analytics/networth')
        return response.data
    },
    getMonthly: async(months?: string): Promise<MonthlySummary[]> => {
        const response = await api.get('/analytics/monthly', {
            params: months ? { months } : {}
        })
        return response.data
    },
    getCategories: async(month: string): Promise<CategoryBreakdown[]> => {
        const response = await api.get('/analytics/categories', {
            params: month ? { month } : {}
        })
        return response.data
    },
    getSpendingByAccount: async(month?: string): Promise<AccountBalance[]> => {
        const response = await api.get('/analytics/accounts', {
            params: month ? { month } : {}
        })
        return response.data
    }
}