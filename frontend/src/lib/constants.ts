import { BankEnum, AccountTypeEnum, CategoryEnum } from "@/types";

// ── Bank Colors ───────────────────────────────────────────────────
export const BANK_COLORS: Record<string, string> = {
  [BankEnum.BCA]: "var(--color-bank-bca)",
  [BankEnum.MANDIRI]: "var(--color-bank-mandiri)",
  [BankEnum.MANDIRI_RDN]: "var(--color-bank-mandiri-rdn)",
  [BankEnum.JAGO]: "var(--color-bank-jago)",
  [BankEnum.SEABANK]: "var(--color-bank-seabank)",
  [BankEnum.OVO]: "var(--color-bank-ovo)",
  [BankEnum.GOPAY]: "var(--color-bank-gopay)",
  [BankEnum.MT4]: "var(--color-bank-mt4)",
  [BankEnum.AJAIB_CRYPTO]: "var(--color-bank-crypto)",
  [BankEnum.CASH]: "var(--color-bank-cash)",
  [BankEnum.OTHER]: "var(--color-bank-other)",
};

// ── Bank Labels ───────────────────────────────────────────────────
export const BANK_LABELS: Record<string, string> = {
  [BankEnum.BCA]: "BCA",
  [BankEnum.MANDIRI]: "Mandiri",
  [BankEnum.MANDIRI_RDN]: "Mandiri RDN",
  [BankEnum.JAGO]: "Bank Jago",
  [BankEnum.SEABANK]: "Seabank",
  [BankEnum.OVO]: "OVO",
  [BankEnum.GOPAY]: "GoPay",
  [BankEnum.MT4]: "MT4 Forex",
  [BankEnum.AJAIB_CRYPTO]: "Ajaib Crypto",
  [BankEnum.CASH]: "Cash",
  [BankEnum.OTHER]: "Other",
};

// ── Account Type Labels ───────────────────────────────────────────
export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  [AccountTypeEnum.SAVINGS]: "Tabungan",
  [AccountTypeEnum.EWALLET]: "E-Wallet",
  [AccountTypeEnum.INVESTMENT]: "Investasi",
  [AccountTypeEnum.POCKET]: "Pocket",
};

// ── Category Labels ───────────────────────────────────────────────
export const CATEGORY_LABELS: Record<string, string> = {
  [CategoryEnum.FOOD]: "Food",
  [CategoryEnum.TRANSPORT]: "Transport",
  [CategoryEnum.SHOPPING]: "Shopping",
  [CategoryEnum.BILLS]: "Bills",
  [CategoryEnum.INVESTMENT]: "Investment",
  [CategoryEnum.SALARY]: "Salary",
  [CategoryEnum.ENTERTAINMENT]: "Entertainment",
  [CategoryEnum.HEALTH]: "Health",
  [CategoryEnum.EDUCATION]: "Education",
  [CategoryEnum.TRANSFER]: "Transfer",
  [CategoryEnum.OTHER]: "Other",
};

// ── Category Colors ───────────────────────────────────────────────
export const CATEGORY_COLORS: Record<string, string> = {
  [CategoryEnum.FOOD]: "#FF6B6B",
  [CategoryEnum.TRANSPORT]: "#4ECDC4",
  [CategoryEnum.SHOPPING]: "#FF5C00",
  [CategoryEnum.BILLS]: "#00AED6",
  [CategoryEnum.INVESTMENT]: "#E8750A",
  [CategoryEnum.SALARY]: "#00B14F",
  [CategoryEnum.ENTERTAINMENT]: "#A855F7",
  [CategoryEnum.HEALTH]: "#EC4899",
  [CategoryEnum.EDUCATION]: "#3B82F6",
  [CategoryEnum.TRANSFER]: "#9E9E9E",
  [CategoryEnum.OTHER]: "#607D8B",
};

// ── Navigation ────────────────────────────────────────────────────
export const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: "layout-dashboard" },
  { label: "Transaksi", path: "/transactions", icon: "arrows-exchange" },
  { label: "Analitik", path: "/analytics", icon: "chart-pie" },
  { label: "Import", path: "/import", icon: "upload" },
  { label: "Pengaturan", path: "/settings", icon: "settings" },
];

// ── App ───────────────────────────────────────────────────────────
export const APP_NAME = "Finku";
export const API_DATE_FORMAT = "YYYY-MM-DD";
export const DISPLAY_DATE_FORMAT = "DD/MM/YYYY";
