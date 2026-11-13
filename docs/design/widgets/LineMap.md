# LineMap — design
Source: James's June 2026 tube map of Jewel Bespoke Build, redrawn in YBT's branding by the working prototype (`/mnt/project-files/workflow-map/prototype/linemap.js`) and its pictures (`workflow-map-after.png`, `workflow-map-before.png`, `site-map-journeys.png` beside it), read 13 Nov 2026. Read from the prototype: values mapped to YBT's tokens.

A map of lines, stations and hand-overs, laid out by itself. Every map on the site is drawn with it: an organisation's workflow map (a line is a role, a station a task, a hand-over what one role gives another) and a product's journey map (a line is a journey, a station a view). It is a content widget: it draws the map and nothing round it. A map that needs a box sits in a panel the page composes.

## Anatomy
1. **Line**: one lane from its first station to its last, `stroke` 6, round caps.
2. **Line name**: to the left of the line's first station, right-aligned, on one or two lines.
3. **Station**: on a whole column of one pitch (92). Its mark says its state (below); its name sits above it, or below when a fork, a line or another name is in the way.
4. **Shared station**: a station on several lines is one capsule across their lanes.
5. **Hand-over**: the giving line forks half a column after its station, falls at 45° and joins the receiving lane half a column before the receiving station, which is drawn as a ring. The last half column is a 2-wide stroke over the receiving line.
6. **Failure mark**: where a hand-over that goes wrong joins, a `signal` disc with a `night` exclamation mark; its title is what goes wrong.
7. **Going back mark**: a small return arrow on the giving station of a hand-over that goes back to an earlier station, which is not drawn as a fork.

## Tokens
- Lines: `stroke-sky`, `stroke-lilac`, `stroke-teal`, `stroke-peach`, `stroke-rose`, `stroke-daylight`; never `go`, `caution` or `signal`.
- Line name: `font-display text-sm font-semibold fill-chalk`.
- Station name: `font-sans text-xs font-medium fill-chalk-muted`; the selected one `font-semibold fill-chalk`; a dimmed one `fill-chalk-faint`.
- Done in one of our products: a `go` dot, 6.5, ringed in `carriage`.
- Planned: a `carriage` dot with a dashed `go` ring.
- Still done elsewhere: a tick, 5 by 12, in the line's colour, on the side away from the name.
- A hand-over arrives: a `carriage` ring, 9, `chalk` stroke 3, with the state's dot inside (none when done elsewhere).
- An output the business runs on: a double ring, 13 with a 6 inside (`go`, dashed `go`, or `chalk` for done elsewhere).
- Shared: a `carriage` capsule, 18 wide, `chalk` stroke 3, rounded at its ends.
- Failure: `fill-signal stroke-carriage`, 8.5.

## States
- default: as above.
- hover: the pointer.
- active/selected: a dashed `chalk` ring round the station (15, or 19 on an output) and its name in `chalk` semibold.
- focus: a `go` ring outside the selected ring, shown only on keyboard focus.
- lit: given a set of stations, the tracks and every other station drop to `opacity-40`.
- disabled: not shown.
- loading: not shown; the map lays out on the server with estimated widths and again in the browser once the fonts have loaded.
- empty: an empty map draws nothing; the page says so.
- error: not shown.

## Variants
- One map on another's layout: a page lays out two maps together (`combinedMap`, then `layoutLineMap`) and draws each on the same places, so Before and After line up.

## Behaviour
- Lanes are ordered so hand-overs and shared stations travel the shortest way: every order is tried up to seven lines, swaps are tried beyond.
- A station with a fork passing both over and under its name is moved on a column.
- A station is a button a keyboard reaches; Enter or Space chooses it, as a click does, and the page hears `onChooseStation`.
- On a phone the map scrolls sideways inside its panel and the page does not.

## Unmapped
- The prototype's line names were 13px; YBT has no 13px type token, so they are `text-sm` (14).

## Exceptions
- Built as `LineMap` in `src/lib/components/lineMap`, with the layout as pure functions in `layout/` (tested on the June map). No page draws it yet: the organisation's workflow map and the product's journeys take it up. Checked 13 Nov 2026.
