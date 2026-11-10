export type ButtonLook = "primary" | "secondary" | "ghost";

export type ButtonSize = "small" | "large";

export const buttonBaseClasses =
  "inline-flex shrink-0 items-center justify-center gap-1 rounded whitespace-nowrap transition disabled:cursor-not-allowed";

export const buttonSizeClasses: Record<ButtonSize, string> = {
  small: "h-11 px-4 py-2 font-display text-sm font-medium md:h-8",
  large: "h-13 px-8 py-4 font-display text-base font-medium",
};

export const iconButtonSizeClasses: Record<ButtonSize, string> = {
  small: "h-11 w-11 font-display text-sm md:h-8 md:w-8",
  large: "h-13 w-13 font-display text-base",
};

export const buttonLookClasses: Record<ButtonLook, string> = {
  primary:
    "bg-go text-night hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100",
  secondary:
    "border border-hairline bg-transparent text-chalk hover:border-hairline-strong hover:bg-carriage-raised disabled:text-chalk-faint",
  ghost:
    "text-chalk-muted hover:bg-carriage-raised hover:text-chalk disabled:text-chalk-faint",
};

export const largeSecondaryBorderClasses = "border-hairline-strong";

export const destructiveClasses =
  "text-signal hover:border-signal hover:text-signal";
