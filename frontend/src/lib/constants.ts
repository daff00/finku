import { BankEnum, AccountTypeEnum, CategoryEnum } from "@/types"

// ── Bank Colors ───────────────────────────────────────────────────
export const BANK_COLORS: Record<string, string> = {
    [BankEnum.BCA]:          "#0066AE",
    [BankEnum.MANDIRI]:      "#F5A623",
    [BankEnum.MANDIRI_RDN]:  "#E8750A",
    [BankEnum.JAGO]:         "#00B14F",
    [BankEnum.SEABANK]:      "#FF5C00",
    [BankEnum.OVO]:          "#4C3494",
    [BankEnum.GOPAY]:        "#00AED6",
    [BankEnum.MT4]:          "#2962FF",
    [BankEnum.AJAIB_CRYPTO]: "#F7931A",
    [BankEnum.CASH]:         "#607D8B",
    [BankEnum.OTHER]:        "#9E9E9E",
}

// ── Bank Labels ───────────────────────────────────────────────────
export const BANK_LABELS: Record<string, string> = {
    [BankEnum.BCA]:          "BCA",
    [BankEnum.MANDIRI]:      "Mandiri",
    [BankEnum.MANDIRI_RDN]:  "Mandiri RDN",
    [BankEnum.JAGO]:         "Bank Jago",
    [BankEnum.SEABANK]:      "Seabank",
    [BankEnum.OVO]:          "OVO",
    [BankEnum.GOPAY]:        "GoPay",
    [BankEnum.MT4]:          "MT4 Forex",
    [BankEnum.AJAIB_CRYPTO]: "Ajaib Crypto",
    [BankEnum.CASH]:         "Cash",
    [BankEnum.OTHER]:        "Other",
}

// ── Account Type Labels ───────────────────────────────────────────
export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
    [AccountTypeEnum.SAVINGS]:    "Tabungan",
    [AccountTypeEnum.EWALLET]:    "E-Wallet",
    [AccountTypeEnum.INVESTMENT]: "Investasi",
    [AccountTypeEnum.POCKET]:     "Pocket",
}

// ── Category Labels ───────────────────────────────────────────────
export const CATEGORY_LABELS: Record<string, string> = {
    [CategoryEnum.FOOD]:          "Makanan",
    [CategoryEnum.TRANSPORT]:     "Transportasi",
    [CategoryEnum.SHOPPING]:      "Belanja",
    [CategoryEnum.BILLS]:         "Tagihan",
    [CategoryEnum.INVESTMENT]:    "Investasi",
    [CategoryEnum.SALARY]:        "Gaji",
    [CategoryEnum.ENTERTAINMENT]: "Hiburan",
    [CategoryEnum.HEALTH]:        "Kesehatan",
    [CategoryEnum.EDUCATION]:     "Pendidikan",
    [CategoryEnum.TRANSFER]:      "Transfer",
    [CategoryEnum.OTHER]:         "Lainnya",
}

// ── Category Colors ───────────────────────────────────────────────
export const CATEGORY_COLORS: Record<string, string> = {
    [CategoryEnum.FOOD]:          "#FF6B6B",
    [CategoryEnum.TRANSPORT]:     "#4ECDC4",
    [CategoryEnum.SHOPPING]:      "#FF5C00",
    [CategoryEnum.BILLS]:         "#00AED6",
    [CategoryEnum.INVESTMENT]:    "#E8750A",
    [CategoryEnum.SALARY]:        "#00B14F",
    [CategoryEnum.ENTERTAINMENT]: "#A855F7",
    [CategoryEnum.HEALTH]:        "#EC4899",
    [CategoryEnum.EDUCATION]:     "#3B82F6",
    [CategoryEnum.TRANSFER]:      "#9E9E9E",
    [CategoryEnum.OTHER]:         "#607D8B",
}

// ── Navigation ────────────────────────────────────────────────────
export const NAV_ITEMS = [
    { label: "Dashboard",    path: "/",            icon: "layout-dashboard" },
    { label: "Transaksi",    path: "/transactions", icon: "arrows-exchange"  },
    { label: "Analitik",     path: "/analytics",   icon: "chart-pie"        },
    { label: "Import",       path: "/import",      icon: "upload"           },
    { label: "Pengaturan",   path: "/settings",    icon: "settings"         },
]

// ── App ───────────────────────────────────────────────────────────
export const APP_NAME = "Finku"
export const API_DATE_FORMAT = "YYYY-MM-DD"
export const DISPLAY_DATE_FORMAT = "DD/MM/YYYY"