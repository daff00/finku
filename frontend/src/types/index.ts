// Enum values
export const BankEnum = {
    // Conventional Bank
    BCA: "BCA",
    MANDIRI: "MANDIRI",

    // Digital Bank
    JAGO: "JAGO",
    SEABANK: "SEABANK",

    // E-Wallets
    OVO: "OVO",
    GOPAY: "GOPAY",

    // Investment / Broker
    MANDIRI_RDN: "MANDIRI_RDN",
    MT4: "MT4",
    AJAIB_CRYPTO: "AJAIB_CRYPTO",

    // Cash
    CASH: "CASH",

    // Other
    OTHER: "OTHER",
} as const

type BankEnum = (typeof BankEnum)[keyof typeof BankEnum]

export const AccountTypeEnum = {
    SAVINGS: "SAVINGS",
    EWALLET: "EWALLET",
    INVESTMENT: "INVESTMENT",
    POCKET: "POCKET",
} as const

type AccountTypeEnum = (typeof AccountTypeEnum)[keyof typeof AccountTypeEnum]


export const TransactionTypeEnum = {
    INCOME: "INCOME",
    EXPENSE: "EXPENSE",
    TRANSFER: "TRANSFER",
} as const

type TransactionTypeEnum = (typeof TransactionTypeEnum)[keyof typeof TransactionTypeEnum]

export const CategoryEnum = {
    FOOD: "FOOD",
    TRANSPORT: "TRANSPORT",
    SHOPPING: "SHOPPING",
    BILLS: "BILLS",
    INVESTMENT: "INVESTMENT",
    SALARY: "SALARY",
    ENTERTAINMENT: "ENTERTAINMENT",
    HEALTH: "HEALTH",
    EDUCATION: "EDUCATION",
    TRANSFER: "TRANSFER",
    OTHER: "OTHER",
} as const

type CategoryEnum = (typeof CategoryEnum)[keyof typeof CategoryEnum]

export const SourceEnum = {
    MANUAL: "MANUAL",
    CSV: "CSV",
    PDF: "PDF",
} as const

type SourceEnum = (typeof SourceEnum)[keyof typeof SourceEnum]

export const CurrencyEnum = {
    IDR: "IDR",
    USD: "USD",
} as const

type CurrencyEnum = (typeof CurrencyEnum)[keyof typeof CurrencyEnum]

export type Account = {
    id: number
    parent_id: number | null
    account_number: string | null
    name: string
    bank: BankEnum
    type: AccountTypeEnum
    color: string
    currency: CurrencyEnum
    is_active: boolean
    created_at: string
}

export type Transaction = {
    id: number
    account_id: number
    date: string
    amount: string
    type: TransactionTypeEnum
    category: CategoryEnum
    note: string
    source: SourceEnum
    currency: CurrencyEnum
    ref_id: string | null
    original_amount: string | null
    original_currency: CurrencyEnum | null
    created_at: string
}

export type Balance = {
    id: number
    account_id: number
    amount: string
    recorded_at: string
}

export type AccountBalance = {
    account_id: number
    name: string
    bank: BankEnum
    color: string
    balance: string
}

export type Networth = {
    total: string
    per_account: AccountBalance[]
}

export type MonthlySummary = {
    month: string          
    income: string
    expenses: string
    savings: string
}

export type CategoryBreakdown = {
    category: CategoryEnum
    total: string
    percentage: number
}

export type ImportResult = {
    total_parsed: number
    imported: number
    duplicates: number
    errors: number
    error_details: string[]
}

// ── Request Types ─────────────────────────────────────────────────

export type AccountCreate = {
    name: string
    bank: BankEnum
    type: AccountTypeEnum
    color: string
    currency?: CurrencyEnum
    parent_id?: number | null
    account_number?: string
}

export type AccountUpdate = {
    name?: string
    color?: string
    currency?: CurrencyEnum
    is_active?: boolean
    parent_id?: number | null
}

export type TransactionCreate = {
    account_id: number
    date: string
    amount: string
    type: TransactionTypeEnum
    category: CategoryEnum
    note?: string
    source?: SourceEnum
    currency?: CurrencyEnum
    original_amount?: string | null
    original_currency?: CurrencyEnum | null
}

export type TransactionUpdate = {
    date?: string
    amount?: string
    type?: TransactionTypeEnum
    category?: CategoryEnum
    note?: string
    source?: SourceEnum
    currency?: CurrencyEnum
    original_amount?: string | null
    original_currency?: CurrencyEnum | null
}

export type TransferCreate = {
    from_account_id: number
    to_account_id: number
    date: string
    amount: string
    note?: string
    fee?: string
    from_currency?: CurrencyEnum
    to_currency?: CurrencyEnum
    from_amount?: string
    to_amount?: string
    rate_applied?: string
}

export type BalanceCreate = {
    account_id: number
    amount: string
}

export type TransactionFilters = {
    account_id?: number
    type?: TransactionTypeEnum
    category?: CategoryEnum
    month?: string
    limit?: number
    offset?: number
}

export interface User {
  id: number;
  username: string;
  display_name: string | null;   // can be null if not set
  is_active: boolean;
  created_at: string;            // ISO 8601 date string
}

export type SpendingCategory = {
  category: string;
  total: string | number;
  percentage: number;
};