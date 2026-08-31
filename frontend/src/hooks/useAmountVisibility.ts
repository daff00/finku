// frontend/src/hooks/useAmountVisibility.ts
import { useState, useEffect, useCallback } from "react";

type SectionName = "netWorth" | "accounts" | "cashflow";

interface VisibilityState {
  global: boolean;
  overrides: Partial<Record<SectionName, boolean>>;
}

const STORAGE_KEY = "dashboard_amount_visibility";

function getInitialState(): VisibilityState {
  if (typeof window === "undefined") return { global: true, overrides: {} };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { global: parsed.global ?? true, overrides: parsed.overrides ?? {} };
    }
  } catch (_) {
    // ignore
  }
  return { global: false, overrides: {} };
}

export function useAmountVisibility() {
  const [state, setState] = useState<VisibilityState>(getInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const toggleGlobal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      global: !prev.global,
    }));
  }, []);

  const getSectionVisible = useCallback(
    (section: SectionName): boolean => {
      // If override exists, use it; otherwise fallback to global
      if (section in state.overrides) {
        return state.overrides[section]!;
      }
      return state.global;
    },
    [state.global, state.overrides]
  );

  const toggleSection = useCallback(
    (section: SectionName) => {
      setState((prev) => {
        const currentOverride = prev.overrides[section];
        const newOverrides = { ...prev.overrides };
        if (currentOverride === undefined) {
          // If no override, set it to the opposite of the global
          newOverrides[section] = !prev.global;
        } else {
          // If override exists, remove it (fall back to global)
          delete newOverrides[section];
        }
        return { ...prev, overrides: newOverrides };
      });
    },
    [state.global]
  );

  const resetAll = useCallback(() => {
    setState({ global: true, overrides: {} });
  }, []);

  return {
    globalVisible: state.global,
    toggleGlobal,
    getSectionVisible,
    toggleSection,
    resetAll,
  };
}