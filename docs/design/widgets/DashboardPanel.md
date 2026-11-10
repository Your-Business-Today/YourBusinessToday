# DashboardPanel — design
Source: the Jewel portals' `Panel` and `.panel` / `.panel-header` recipes (`jpms/DESIGN-SYSTEM.md` §2, `docs/ui/open-book-design-rules.md` §4) and YBT's `DashboardPanel.svelte`, read 10 Nov 2026. Read from code: values mapped to YBT's tokens.

The panel: the square, bordered box that holds a table, a list, a form or a figure. It is a container widget, so it draws the box that the content widgets inside it do not.

## Anatomy
1. **Header**: the title, with a count beside it; the panel's actions on the right.
2. **Toolbar** (optional): a row of filters or a search under the header.
3. **Body**: the content, padded, or flush when it is a table or a list that runs to the edges.

## Tokens
- Box: `border border-hairline bg-carriage`, no radius, no shadow.
- Header: `flex flex-wrap items-center justify-between gap-2 px-6 py-4 border-b border-hairline`.
- Title: `font-display text-lg font-semibold text-chalk`, sentence case.
- Count: a neutral `Badge` beside the title.
- Actions: small `Button`s, secondary; at most one primary, and only when the panel is the view's main act.
- Toolbar: `px-6 py-3 border-b border-hairline`.
- Body: `p-6`; flush (no padding) for a `RecordsTable` or a list.
- Between panels: `gap-6`.

## States
- default: as above.
- hover: none; the panel is not a control.
- active/selected: not shown.
- disabled: not shown.
- loading: the body shows the spinner centred; the header stays.
- empty: the body shows `EmptyState`.
- error: a notice at the top of the body, in `signal`.

## Variants
- Scrolling: the body scrolls inside a maximum height (`max-h-*` on the body), and a table's header sticks to its top.
- Flush: the body has no padding, for a table or a list.

## Behaviour
- Nothing of its own: it frames what it holds.

## Unmapped
- YBT's panel today is rounded (`rounded-xl`) with a small-capitals title (`text-xs tracking-widest uppercase`); the brand drops both (rules 5 and 6).
- `panelClasses` in `formStyles.ts` (`rounded-2xl border p-5`) is a second panel written as a class string; the next task folds it into this widget.

## Exceptions
- The body is flush unless the view asks for `isPadded`. Every view that uses the panel pads its own body today, so a padded default would pad them twice; the views take up `isPadded` and drop their own padding in the refactor rounds. Checked 10 Nov 2026.
- The scrolling variant is `scrollHeightClass` (a `max-h-*` class for the body), and the loading and error states are `isLoading` and `errorMessage`. The empty state stays the view's, composed from `EmptyState`.
