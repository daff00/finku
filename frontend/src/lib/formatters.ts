// ── Currency ──────────────────────────────────────────────────────
export const formatIDR = (amount: string | number): string => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(amount))
}

// short format — Rp 12,5jt instead of Rp 12.500.000
export const formatIDRShort = (amount: string | number): string => {
    const num = Number(amount)
    if (num >= 1_000_000_000) {
        return `Rp ${(num / 1_000_000_000).toFixed(1)}M`
    }
    if (num >= 1_000_000) {
        return `Rp ${(num / 1_000_000).toFixed(1)}jt`
    }
    if (num >= 1_000) {
        return `Rp ${(num / 1_000).toFixed(0)}rb`
    }
    return `Rp ${num}`
}

// ── Date ──────────────────────────────────────────────────────────
// full date — "9 Agustus 2026"
export const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    })
}

// short date — "09/08/2026"
export const formatDateShort = (dateStr: string): string => {
    const date = new Date(dateStr)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

export const formatMonth = (monthStr: string): string => {
    // "2026-08" → "Agustus 2026"
    const [year, month] = monthStr.split("-")
    return new Date(Number(year), Number(month) - 1).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
    })
}

export const getCurrentMonth = (): string => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

// ── Number ────────────────────────────────────────────────────────
export const formatPercent = (value: number): string => {
    return `${value.toFixed(1)}%`
}

export const formatAmount = (
    amount: string | number,
    type: "INCOME" | "EXPENSE" | "TRANSFER"
): string => {
    const formatted = formatIDR(amount)
    if (type === "INCOME") return `+${formatted}`
    if (type === "EXPENSE") return `−${formatted}`
    return formatted
}

export function toTitleCase(value: string): string {
  const lowercaseWords = new Set(["and", "or", "of", "the", "for", "to"]);

  return value
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word, index) => {
      if (index > 0 && lowercaseWords.has(word)) {
        return word;
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}