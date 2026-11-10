# FormField — design
Source: the Jewel portals' `FormField` and `.field` recipe (`jpms/Styles/app.tailwind.css`, `docs/ui/open-book-design-rules.md` §4.6) and YBT's `FormField.svelte`, `SmallCapsField.svelte` and `formStyles.ts`, read 10 Nov 2026. Read from code: values mapped to YBT's tokens.

A labelled control: the label, the input, select or textarea, and a hint or an error under it. It is a content widget: the control's own border is the control, and there is no box round the field.

## Anatomy
1. **Label**, above the control, with `*` when it is required.
2. **Control**: a text input, a select with its chevron, or a textarea.
3. **Hint** or **error**, under the control.

## Tokens
- Field: `flex flex-col gap-1`.
- Label: `text-sm font-medium text-chalk-subtle`, sentence case.
- Control: `w-full h-11 rounded border border-hairline-strong bg-carriage-raised px-4 py-3 text-base text-chalk placeholder:text-chalk-faint outline-none`; a textarea frees the height; a select carries its chevron in `chalk-subtle`, 16.
- Hint: `text-xs font-medium text-chalk-faint`.
- Error: `text-xs font-medium text-signal`.
- Fields side by side: `gap-4`; groups of fields: `gap-8`.
- Checkbox and radio (beside a label, not in a FormField): 16, `rounded` (radio `rounded-full`), `border border-hairline-strong bg-carriage-raised`, ticked in `go`.

## States
- default: as above.
- hover: none.
- focus: the control's border `go`.
- disabled: the control's text `chalk-faint`, not editable.
- loading: not shown.
- empty: the placeholder in `chalk-faint`.
- error: the control's border `signal`, the error under it.

## Variants
- Text, select, textarea.

## Behaviour
- The control's limits (length, range, step, required, pattern, choices) mirror the column the value is written to, as the code rules say; the service is still the guard.
- The error names the field and the limit.

## Unmapped
- YBT's fields today are `rounded-xl` on `night` (darker than the panel); the brand turns that round: fields are lighter than the panel (rule 1).
- `SmallCapsField` labels in small capitals with letter spacing; it folds into this widget (rule 5).

## Exceptions
- The field styles the control it holds (an input, a select or a textarea placed directly inside it), so every field takes the sheet's control look now without its view changing; the view's own class strings (`fieldClasses`, `inputClasses`) lose to it and go in the refactor rounds. The width stays the view's.
- The `*` is added for any control marked `required`, so the label and the column's rule cannot disagree.
- `SmallCapsField` now draws a `FormField`; the views move to `FormField` itself in the rounds. Checked 10 Nov 2026.
