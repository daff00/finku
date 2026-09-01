import { useQuery } from '@tanstack/react-query'
import { exchangeRateService } from '@/services'

export const useExchangeRate = () => {
  return useQuery({
    queryKey: ['exchange-rate', 'USD'],
    queryFn: exchangeRateService.getUSDtoIDR,
    staleTime: 1000 * 60 * 60 * 24,  // 24 hours
    gcTime: 1000 * 60 * 60 * 24,
  })
}