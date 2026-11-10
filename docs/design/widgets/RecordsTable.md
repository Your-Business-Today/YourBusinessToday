# RecordsTable — design
Source: the Jewel portals' `RecordsTable` and `.data-table` recipe (`jpms/Styles/app.tailwind.css`, `docs/ui/open-book-design-rules.md` §4.4, `docs/ui/widget-catalogue.md`) and YBT's subject tables (`ProjectTable`, `ClientTable`, `PeopleTable` and others), read 10 Nov 2026. Read from code: values mapped to YBT's tokens.

A list of records: one row per record, one column per property. YBT has no shared table yet; this sheet comes before the widget, which the task "YBT's shared widgets match their designs" builds. It is a content widget: it draws its rows and nothing round them. A table that needs a box sits in a panel: `<DashboardPanel><RecordsTable/></DashboardPanel>`.

## Anatomy
1. **Header row**: one cell per column, a sortable column with its arrow.
2. **Body rows**: one per record. A link cell (the record's name), text cells, a trailing figure cell, an optional actions cell at the end.
3. **Totals row** (optional), in the table's foot.
4. **Empty row**: the empty state across every column.

## Tokens
- Table: `w-full text-sm text-left border-collapse`. No outer border, no radius.
- Header cell: `sticky top-0 z-10 h-10 px-4 md:px-6 py-3 bg-night border-b border-hairline-strong text-sm font-semibold text-chalk`, sentence case, aligned to the foot of the cell.
- Body cell: `h-12 px-4 md:px-6 py-4 bg-carriage border-b border-hairline-strong text-chalk-muted`. The last row has no bottom border.
- Link cell: `font-medium text-chalk`, underlined on hover.
- Figure cell: `font-medium text-chalk text-right`; a negative figure `text-signal`, a positive delta `text-go`.
- Status cell: a `Badge`.
- Actions cell: small `Button`s, secondary or ghost, or the row's actions menu.
- Totals row: `bg-night font-semibold text-chalk`, `border-t border-hairline-strong`.

## States
- default: as above.
- hover: a clickable row's cells take `bg-carriage-raised` and the pointer.
- active/selected: a selected row's cells take `bg-carriage-raised`; its checkbox ticked.
- disabled: not shown.
- loading: the spinner in one row across every column.
- empty: `EmptyState` in one row across every column, with room for the one action.
- error: not shown; an error is the panel's notice.

## Variants
- Dense: rows `h-10 py-2`, for long registers of figures.
- Selectable: a 16px checkbox leads each row and the header.

## Behaviour
- A row opens its record on a plain click (YBT's `rowLink` action), over the list where YBT opens records that way (the task sheet over the board).
- The header sticks to the top of a scrolling panel.
- A column sorts on a press on its header; the arrow shows the direction.
- On a phone the table scrolls sideways inside its panel rather than squeezing its columns.

## Unmapped
- YBT's subject tables today draw their own rounded border and use opacities of `chalk` for their text; the widget takes both out (rules 3 and 6).

## Exceptions
- Built as `RecordsTable` with `RecordsCell` for its cells (`kind`: text, link, figure, status, actions), in `src/lib/components/workspace`. A column sorts when it is given a `sortValue`; the rows are sorted in the browser, among the rows the view gave it.
- The empty row is a sentence in `chalk-subtle` rather than `EmptyState`, whose dashed box would put a box inside the table.
- Its first user is the client page's support list (`SupportTaskTable`), so the widget has a caller from the day it lands; the other subject tables take it up in the refactor rounds. Checked 10 Nov 2026.
