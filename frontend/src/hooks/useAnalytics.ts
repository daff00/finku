import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services";

// ── Query Keys ────────────────────────────────────────────────────
export const analyticsKeys = {
    networth: ["analytics", "networth"] as const,
    monthly: (months?: string) => ["analytics", "monthly", months] as const,
    categories: (month?: string) => ["analytics", "categories", month] as const,
    spendingByAccount: (month?: string) => ["analytics", "accounts", month] as const,
}

// ── Hooks ─────────────────────────────────────────────────────────
export const useNetworth = () => {
    return useQuery({
        queryKey: analyticsKeys.networth,
        queryFn: analyticsService.getNetworth,
    })
}

export const useMonthly = (months?: string) => {
    return useQuery({
        queryKey: analyticsKeys.monthly(months),
        queryFn: () => analyticsService.getMonthly(months),
    })
}

export const useCategories = (month?: string) => {
    return useQuery({
        queryKey: analyticsKeys.categories(month),
        queryFn: () => analyticsService.getCategories(month),
    })
}

export const useSpendingByAccount = (month?: string) => {
    return useQuery({
        queryKey: analyticsKeys.spendingByAccount(month),
        queryFn: () => analyticsService.getSpendingByAccount(month),
    })
}