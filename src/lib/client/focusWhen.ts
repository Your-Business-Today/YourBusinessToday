import type { Action } from "svelte/action";

/** Puts the cursor in a field as the page arrives, when the page asks for it. */
export const focusWhen: Action<HTMLElement, boolean> = (field, shouldFocus) => {
  if (shouldFocus) field.focus();
};
