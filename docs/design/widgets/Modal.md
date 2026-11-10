# Modal — design
Source: the Jewel portals' `Modal` and `.modal-overlay` / `.modal-panel` recipes (`jpms/Styles/app.tailwind.css`, `docs/ui/open-book-design-rules.md` §4.7) and YBT's `Modal.svelte` and `ModalHeader.svelte`, read 10 Nov 2026. Read from code: values mapped to YBT's tokens.

The dialog: a panel over the page, for a form or a question. A container widget.

## Anatomy
1. **Scrim** over the page.
2. **Panel**:
   1. **Header**: the title, and the close button on the right; a hairline under it.
   2. **Body**: sections, each with its title.
   3. **Footer**: Cancel, then the primary action, on the right.

## Tokens
- Scrim: `fixed inset-0 z-50 flex items-center justify-center bg-night/70 p-4`.
- Panel: `w-full max-w-[600px] rounded-lg border border-hairline-strong bg-night shadow-2xl`, `flex flex-col gap-8`, padding `p-5 md:p-8`; its height follows the screen (`max-h-dvh`), the body scrolling inside.
- Title: `font-display text-2xl font-semibold text-chalk`.
- Close: a ghost icon button, 24 glyph in `chalk`.
- Header rule: `border-b border-hairline pb-4`.
- Section title: `font-display text-lg font-semibold text-chalk`; a section's contents `gap-4`.
- Footer: `flex flex-wrap justify-end gap-2`, Large buttons: secondary Cancel, then the primary.

## States
- default: as above.
- hover: as its buttons.
- active/selected: not shown.
- disabled: the primary disabled until the form can be sent.
- loading: the primary shows "Saving…"; the dialog stays open.
- empty: not shown.
- error: a notice at the top of the body, in `signal`; each field's error under it.

## Variants
- Wide: a larger `max-w-*` for a dialog holding a table.
- Confirm: a question, Cancel and the act; a destructive act is a destructive secondary button, never a `signal` fill.

## Behaviour
- Opens with `backdropFade` for the scrim and `dialogRise` for the panel.
- Escape, the close button and Cancel close it.
- Focus moves into the dialog and stays there until it closes.
- On a phone the padding comes in to 20 and the footer wraps.

## Unmapped
- YBT's dialog today is `rounded-2xl` on `carriage` with `p-6`; the brand makes it `rounded-lg` on `night` with `p-8` (rules 1 and 6).
- The Jewel dialog's own shadow (`0 4px 16px` black at 80%) is not a YBT token; `shadow-2xl` is the nearest and is kept.
