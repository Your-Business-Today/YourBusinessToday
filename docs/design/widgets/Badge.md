# Badge — design
Source: the Jewel portals' `Pill` (`docs/ui/widget-catalogue.md`, Tone and StatusTones), and YBT's status badges (`ProjectStatusBadge.svelte`, `SignalBadge.svelte` and the counts in `DashboardPanel` and `TabStrip`), read 10 Nov 2026. Read from code: values mapped to YBT's tokens.

A status, a count or a small qualifier ("Draft", "Overdue", "3"). YBT has no shared badge yet; this sheet comes before it. One shape everywhere, coloured only by its tone: a view maps its status to a tone and never picks a colour.

## Anatomy
1. **Dot** (optional), 6, before the label.
2. **Label**.

## Tokens
- Shape: `inline-flex items-center gap-1 rounded px-2 py-0.5 font-display text-xs font-medium whitespace-nowrap`.
- Positive (done, live, paid): `bg-go/10 text-go`.
- Warning (needs a look): `bg-caution/10 text-caution`.
- Negative (failed, overdue, on hold): `bg-signal/10 text-signal`.
- Progress (further along, not yet done): `bg-daylight/10 text-daylight`.
- Not started: `bg-etch/10 text-etch`.
- Neutral (and counts): `bg-carriage-raised text-chalk-subtle`.

## States
- default: as its tone.
- hover: none, unless it opens something: then a chevron after the label and `text-chalk` on hover.
- active/selected: not shown.
- disabled: not shown.
- loading: not shown.
- empty: not shown.
- error: the negative tone.

## Variants
- With a dot; as a button that opens a status's dialog.

## Behaviour
- None of its own.

## Unmapped
- `SignalBadge` (a solid `signal` fill with capitals, on the public home and offer pages) has no place in the tones; it is a public-page mark and stays there until the public pages are designed.
- YBT's status badges today are outlined pills (`rounded-full border`); the brand makes them `rounded` tints.
