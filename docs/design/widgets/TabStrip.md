# TabStrip — design
Source: the Jewel portals' `TabRow` and `.tab` / `.tab-active` / `.chip-count` recipes (`jpms/Styles/app.tailwind.css`) and YBT's `TabStrip.svelte`, read 10 Nov 2026. Read from code: values mapped to YBT's tokens.

A row of tabs, each changing the pane or the route below it. A content widget. A page's one main filter is its tab row too, each tab counting what it holds, as Projects' statuses and Tasks' departments are (James, 12 Nov 2026); a lesser filter beside it is a chip or a search box.

## Anatomy
1. **Row**, with a hairline along its foot.
2. **Tab**: its label, and a count beside it.
3. **Divider**: a short upright hairline after a tab that is set apart.

## Tokens
- Row: `flex gap-1 overflow-x-auto border-b border-hairline`, its scroll bar hidden (`scrollbar-hidden`).
- Tab: `-mb-px inline-flex shrink-0 items-center gap-1.5 border-b-2 border-transparent px-3 py-3 md:py-2 font-display text-sm font-medium text-chalk-faint whitespace-nowrap`.
- Picked tab: `border-go text-chalk`.
- Count: `rounded bg-carriage-raised px-1.5 py-0.5 text-xs text-chalk-subtle`.
- Divider: `mx-2 my-auto h-4 w-px shrink-0 bg-hairline-strong`, hidden from a screen reader.

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
- A tab set apart (`isSetApart`): a tab of another kind than the rest of its row stands first with the divider after it, as Projects' Priority tasks does, which lists tasks where every other tab is a project status (James, 12 Nov 2026). It looks like any other tab; only the divider and its name tell it apart.

## Behaviour
- The pane changes with `tabSwap`.
- On a phone the row scrolls sideways; a tab is 44 tall, and the picked tab is brought into view, so a page that opens on a tab far along its row shows which one it is on.
- A page the side bar lists has one row of tabs at most, first in its body under the page header, and no row inside a tab's pane (James, 12 Nov 2026).

## Unmapped
- YBT's count today is a pill (`rounded-full`) on `carriage`; the brand makes it `rounded` on `carriage-raised`.

## Exceptions
- The count is the neutral `Badge` (`px-2` rather than `px-1.5`), so a count reads the same beside a tab as beside a panel's title. A tab given an `href` is a link (route tabs); without one it is a button (pane tabs). Checked 10 Nov 2026.
