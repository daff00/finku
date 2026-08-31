import api from './api'

export type ExchangeRate = {
  from: string
  to: string
  rate: number
  fetched_at: string
  cached: boolean
}

export const exchangeRateService = {
  getUSDtoIDR: async (): Promise<ExchangeRate> => {
    const response = await api.get('/exchange-rate/USD')
    return response.data
  },
}