import { keyboardKeys } from "./keyboardKeys";
import type { Action } from "svelte/action";

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Moves focus into a dialog as it opens, keeps Tab inside it, and gives focus back when it closes. */
export const focusTrap: Action<HTMLElement> = (dialog) => {
  const focusedBefore = document.activeElement as HTMLElement | null;
  dialog.focus();

  function keepTabInside(event: KeyboardEvent) {
    if (event.key !== keyboardKeys.tab) return;
    const focusables = Array.from(
      dialog.querySelectorAll<HTMLElement>(focusableSelector),
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    const isLeavingBackwards =
      event.shiftKey && (active === first || active === dialog);
    const isLeavingForwards = !event.shiftKey && active === last;
    if (isLeavingBackwards) last.focus();
    if (isLeavingForwards) first.focus();
    if (isLeavingBackwards || isLeavingForwards) event.preventDefault();
  }

  dialog.addEventListener("keydown", keepTabInside);
  return {
    destroy() {
      dialog.removeEventListener("keydown", keepTabInside);
      focusedBefore?.focus();
    },
  };
};
