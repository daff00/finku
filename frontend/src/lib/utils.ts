import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { BANK_COLORS } from "@/lib/constants"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// get bank color with fallback
export const getBankColor = (bank: string): string => {
    return BANK_COLORS[bank] ?? "#9E9E9E"
}

// get initials from name — "BCA Main" → "BM"
export const getInitials = (name: string): string => {
    return name
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
}

// check if amount is positive
export const isPositive = (amount: string | number): boolean => {
    return Number(amount) >= 0
}

// get today in API format — "2026-08-12"
export const getTodayForAPI = (): string => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}