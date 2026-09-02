// frontend/src/hooks/useAmountVisibility.ts
import { useState, useEffect, useCallback, useRef } from "react";

type SectionName = "netWorth" | "accounts" | "cashflow";

interface VisibilityState {
  global: boolean;
  overrides: Partial<Record<SectionName, boolean>>;
}

const STORAGE_KEY = "dashboard_amount_visibility";
const LAST_USER_KEY = "dashboard_amount_visibility_user";

const HIDDEN_STATE: VisibilityState = { global: false, overrides: {} };

function getInitialState(): VisibilityState {
  if (typeof window === "undefined") return HIDDEN_STATE;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { global: parsed.global ?? false, overrides: parsed.overrides ?? {} };
    }
  } catch (_) {
    // ignore
  }
  return HIDDEN_STATE;
}

function getStoredUserId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(LAST_USER_KEY);
}

export function useAmountVisibility(userId?: string | number | null) {
  const normalizedUserId = userId != null ? String(userId) : null;

  // On first mount, decide synchronously whether this counts as a "new login"
  // by comparing against the persisted last-known user id (not a ref, which
  // wouldn't survive a page-switch remount).
  const [state, setState] = useState<VisibilityState>(() => {
    if (normalizedUserId != null && normalizedUserId !== getStoredUserId()) {
      return HIDDEN_STATE;
    }
    return getInitialState();
  });

  const didInit = useRef(false);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (normalizedUserId == null) return;

    const storedUserId = getStoredUserId();

    if (!didInit.current) {
      // Already handled synchronously in useState initializer above —
      // just record the user id so future remounts on the same session
      // don't re-trigger a reset.
      sessionStorage.setItem(LAST_USER_KEY, normalizedUserId);
      didInit.current = true;
      return;
    }

    if (normalizedUserId !== storedUserId) {
      setState(HIDDEN_STATE);
      sessionStorage.setItem(LAST_USER_KEY, normalizedUserId);
    }
  }, [normalizedUserId]);

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

  const toggleSection = useCallback((section: SectionName) => {
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
  }, []);

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