// frontend/src/components/CurrencyToggle.tsx
import { useCurrency } from "@/contexts/CurrencyContext";

export default function CurrencyToggle() {
  const { currency, toggleCurrency } = useCurrency();

  return (
    <button
      onClick={toggleCurrency}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-sans font-medium text-text-secondary hover:text-text-primary transition-colors rounded-[4px] hover:bg-border/30 border border-transparent hover:border-border"
      aria-label={`Switch to ${currency === "IDR" ? "USD" : "IDR"}`}
    >
      {currency === "IDR" ? (
        <>
          <span className="text-xs">🇮🇩</span>
          <span>IDR</span>
        </>
      ) : (
        <>
          <span className="text-xs">🇺🇸</span>
          <span>USD</span>
        </>
      )}
    </button>
  );
}