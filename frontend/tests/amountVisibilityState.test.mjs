import assert from "node:assert/strict";
import test from "node:test";
import {
  getSectionVisibility,
  toggleGlobalVisibilityState,
  toggleSectionVisibilityState,
} from "../src/hooks/amountVisibilityState.ts";

test("global hide overrides prior visible section settings", () => {
  const state = toggleGlobalVisibilityState({
    global: true,
    overrides: { netWorth: true, accounts: false },
  });

  assert.deepEqual(state, { global: false, overrides: {} });
  assert.equal(getSectionVisibility(state, "netWorth"), false);
  assert.equal(getSectionVisibility(state, "accounts"), false);
  assert.equal(getSectionVisibility(state, "cashflow"), false);
});

test("global show overrides prior hidden section settings", () => {
  const state = toggleGlobalVisibilityState({
    global: false,
    overrides: { netWorth: false, accounts: true },
  });

  assert.deepEqual(state, { global: true, overrides: {} });
  assert.equal(getSectionVisibility(state, "netWorth"), true);
  assert.equal(getSectionVisibility(state, "accounts"), true);
  assert.equal(getSectionVisibility(state, "cashflow"), true);
});

test("section overrides can be set after a global toggle and then cleared", () => {
  const globallyHidden = toggleGlobalVisibilityState({
    global: true,
    overrides: { netWorth: true },
  });
  const sectionShown = toggleSectionVisibilityState(globallyHidden, "netWorth");

  assert.equal(getSectionVisibility(sectionShown, "netWorth"), true);
  assert.equal(getSectionVisibility(sectionShown, "accounts"), false);

  const sectionFollowsGlobal = toggleSectionVisibilityState(sectionShown, "netWorth");
  assert.deepEqual(sectionFollowsGlobal.overrides, {});
  assert.equal(getSectionVisibility(sectionFollowsGlobal, "netWorth"), false);
});
