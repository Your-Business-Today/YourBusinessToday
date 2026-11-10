# Button — design
Source: the Jewel portals' `Button` and `.btn-*` recipes (`jpms/Styles/app.tailwind.css`, `jpms/DESIGN-SYSTEM.md` §2, `docs/ui/open-book-design-rules.md` §4.2) and YBT's button class strings (`formStyles.ts`, `workspaceStyles.ts`) and `SubmitButton.svelte`, read 10 Nov 2026. Read from code: values mapped to YBT's tokens.

Every button. YBT has no shared button yet: its buttons are class strings; this sheet comes before the widget, which the task "YBT's shared widgets match their designs" builds. Two sizes and three looks, and that is all.

## Anatomy
1. **Icon** (optional), 16, before the label.
2. **Label**.

## Tokens
- Small (every in-view action): `inline-flex items-center justify-center gap-1 h-11 md:h-8 rounded px-4 py-2 font-display text-sm font-medium`.
- Large (dialog and form submits): `h-13 px-8 py-4 font-display text-base font-medium`, at every width.
- Primary: `bg-go text-night`, hover `brightness-110`. One in a view or in a dialog's footer, on the right.
- Secondary: `border border-hairline bg-transparent text-chalk`, hover `border-hairline-strong bg-carriage-raised`; Large takes `border-hairline-strong`.
- Ghost: `text-chalk-muted`, hover `text-chalk bg-carriage-raised`; for quiet dismissals.
- Destructive: a secondary or ghost button with `text-signal`; hover `border-signal`. Never a `signal` fill.
- Icon button: a secondary button as a square, `w-11 h-11 md:w-8 md:h-8`.

## States
- default: as above.
- hover: as each look says.
- active/selected: not shown.
- disabled: primary `opacity-50`; secondary and ghost text `chalk-faint`; the pointer `not-allowed`.
- loading: the spinner (14, `border-2 border-current`) and "Saving…" in place of the label; disabled while it saves.
- empty: not shown.
- error: not shown.

## Variants
- Small or Large; primary, secondary or ghost; destructive; icon only.

## Behaviour
- A dialog's footer uses Large: dismiss on the left, the primary on the right.
- Below `md` a Small button stands 44 tall, a thumb's target; a view never sizes a button for a phone itself.

## Unmapped
- YBT's buttons today are pills (`rounded-full`) and its main button is filled `signal`; the brand makes them `rounded` and the main button `go` (rules 4 and 6).
- `confirmButtonClasses` (a `go` outline that fills on hover) has no place in two looks; it becomes the primary or the secondary.

## Exceptions
- Built as `Button` (`look`, `size`, `isDestructive`, `isIconOnly`, `isSaving`, `href` for a link drawn as a button, `name` and `value` for a submit that says which of a form's buttons was pressed). Its first users are the dialog's close button and the sheet's two buttons; the views' class strings (`primaryButtonClasses`, `panelButtonClasses` and the rest) and `SubmitButton` move to it in the refactor rounds, so the `signal` filled buttons stay until then. Checked 10 Nov 2026.
