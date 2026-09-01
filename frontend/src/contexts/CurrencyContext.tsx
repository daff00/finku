// frontend/src/contexts/CurrencyContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { formatIDR } from "@/lib/formatters"

type Currency = "IDR" | "USD";

interface CurrencyContextType {
  currency: Currency;
  toggleCurrency: () => void;
  setCurrency: (currency: Currency) => void;
  rate: number | undefined;
  isLoading: boolean;
  formatAmount: (amount: number, sourceCurrency?: Currency) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = "finku_currency";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as Currency) || "IDR";
  });

  const { data, isLoading } = useExchangeRate();
  const rate = data?.rate;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currency);
  }, [currency]);

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === "IDR" ? "USD" : "IDR"));
  };

  const formatAmount = (amount: number, sourceCurrency: Currency = "IDR"): string => {
    const formatAsCurrency = (value: number, target: Currency) => {
      if (target === "IDR") return formatIDR(value);
      if (isLoading) return "$ •••";
      if (!rate) return "$ —";
      return `$${value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    if (sourceCurrency === currency) {
      return formatAsCurrency(amount, currency);
    }

    if (sourceCurrency === "USD" && currency === "IDR") {
      const value = amount * (rate ?? 0);
      return formatIDR(value);
    }

    if (sourceCurrency === "IDR" && currency === "USD") {
      if (isLoading) return "$ •••";
      if (!rate) return "$ —";
      const usdAmount = amount / rate;
      return `$${usdAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    return formatAsCurrency(amount, currency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        toggleCurrency,
        setCurrency,
        rate,
        isLoading,
        formatAmount,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}