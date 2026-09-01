// frontend/src/hooks/useAmountVisibility.ts
import { useState, useEffect, useCallback, useRef } from "react";

type SectionName = "netWorth" | "accounts" | "cashflow";

interface VisibilityState {
  global: boolean;
  overrides: Partial<Record<SectionName, boolean>>;
}

const STORAGE_KEY = "dashboard_amount_visibility";

const HIDDEN_STATE: VisibilityState = { global: false, overrides: {} };

function getInitialState(): VisibilityState {
  if (typeof window === "undefined") return HIDDEN_STATE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { global: parsed.global ?? false, overrides: parsed.overrides ?? {} };
    }
  } catch (_) {
    // ignore
  }
  return HIDDEN_STATE;
}

// Pass the current logged-in user's id (or null when logged out).
// Whenever it changes to a new non-null value, visibility resets to hidden.
export function useAmountVisibility(userId?: string | number | null) {
  const [state, setState] = useState<VisibilityState>(getInitialState);
  const lastUserId = useRef<string | number | null | undefined>(null);

  // Persist on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Force-hide on every new login session
  useEffect(() => {
    if (userId != null && userId !== lastUserId.current) {
      setState(HIDDEN_STATE);
    }
    lastUserId.current = userId;
  }, [userId]);

  const toggleGlobal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      global: !prev.global,
    }));
  }, []);

  const getSectionVisible = useCallback(
    (section: SectionName): boolean => {
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
          newOverrides[section] = !prev.global;
        } else {
          delete newOverrides[section];
        }
        return { ...prev, overrides: newOverrides };
      });
    },
    []
  );

  const resetAll = useCallback(() => {
    setState(HIDDEN_STATE);
  }, []);

  return {
    globalVisible: state.global,
    toggleGlobal,
    getSectionVisible,
    toggleSection,
    resetAll,
  };
}