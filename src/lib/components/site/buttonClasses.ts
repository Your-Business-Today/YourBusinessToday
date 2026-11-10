import {
  buttonBaseClasses,
  buttonLookClasses,
  buttonSizeClasses,
  destructiveClasses,
  iconButtonSizeClasses,
  largeSecondaryBorderClasses,
  type ButtonLook,
  type ButtonSize,
} from "./buttonLooks";

export type ButtonStyle = {
  look: ButtonLook;
  size: ButtonSize;
  isDestructive: boolean;
  isIconOnly: boolean;
};

export function classesForButton(style: ButtonStyle): string {
  const sizeClasses = style.isIconOnly
    ? iconButtonSizeClasses[style.size]
    : buttonSizeClasses[style.size];
  const isLargeSecondary = style.look === "secondary" && style.size === "large";
  return [
    buttonBaseClasses,
    sizeClasses,
    buttonLookClasses[style.look],
    isLargeSecondary ? largeSecondaryBorderClasses : "",
    style.isDestructive ? destructiveClasses : "",
  ].join(" ");
}
