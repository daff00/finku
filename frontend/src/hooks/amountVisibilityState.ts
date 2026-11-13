export type SectionName = "netWorth" | "accounts" | "cashflow";

export interface VisibilityState {
  global: boolean;
  overrides: Partial<Record<SectionName, boolean>>;
}

export const HIDDEN_STATE: VisibilityState = { global: false, overrides: {} };

export function toggleGlobalVisibilityState(
  previous: VisibilityState
): VisibilityState {
  return { global: !previous.global, overrides: {} };
}

export function getSectionVisibility(
  state: VisibilityState,
  section: SectionName
): boolean {
  return state.overrides[section] ?? state.global;
}

export function toggleSectionVisibilityState(
  previous: VisibilityState,
  section: SectionName
): VisibilityState {
  const overrides = { ...previous.overrides };
  if (overrides[section] === undefined) {
    overrides[section] = !previous.global;
  } else {
    delete overrides[section];
  }
  return { ...previous, overrides };
}
