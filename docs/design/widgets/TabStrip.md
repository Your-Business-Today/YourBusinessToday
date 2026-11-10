# TabStrip — design
Source: the Jewel portals' `TabRow` and `.tab` / `.tab-active` / `.chip-count` recipes (`jpms/Styles/app.tailwind.css`) and YBT's `TabStrip.svelte`, read 10 Nov 2026. Read from code: values mapped to YBT's tokens.

A row of tabs, each changing the pane or the route below it. A content widget. (A filter of local state is a chip, not a tab.)

## Anatomy
1. **Row**, with a hairline along its foot.
2. **Tab**: its label, and a count beside it.

## Tokens
- Row: `flex gap-1 overflow-x-auto border-b border-hairline`, its scroll bar hidden (`scrollbar-hidden`).
- Tab: `-mb-px inline-flex shrink-0 items-center gap-1.5 border-b-2 border-transparent px-3 py-3 md:py-2 font-display text-sm font-medium text-chalk-faint whitespace-nowrap`.
- Picked tab: `border-go text-chalk`.
- Count: `rounded bg-carriage-raised px-1.5 py-0.5 text-xs text-chalk-subtle`.

## States
- default: `chalk-faint`.
- hover: `text-chalk`.
- active/selected: the `go` underline and `chalk` label; `aria-selected`.
- disabled: not shown.
- loading: not shown.
- empty: a count of nought is still shown.
- error: not shown.

## Variants
- Route tabs (links) or pane tabs (buttons): one look.

## Behaviour
- The pane changes with `tabSwap`.
- On a phone the row scrolls sideways; a tab is 44 tall.

## Unmapped
- YBT's count today is a pill (`rounded-full`) on `carriage`; the brand makes it `rounded` on `carriage-raised`.
