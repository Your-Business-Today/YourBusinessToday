# Brand

Sources: YBT's theme (`src/app.css`, `@theme`), YBT's motion (`src/lib/client/motion.ts`) and its shared widgets (`src/lib/components/site`, `src/lib/components/workspace`); the Jewel portals' design system, read only, in `Your-Business-Today/jewel-portal` (`jpms/DESIGN-SYSTEM.md`, `docs/ui/open-book-design-rules.md`, `jpms/Styles/app.tailwind.css`, `jpms/Layout/`). Read 10 Nov 2026.

The colours and the type are YBT's own. The rules for using them are the Jewel portals', written in YBT's token names, because James asked for the YBT portal to look like the Jewel portals with YBT's branding (10 Nov 2026). Five tokens were added to the theme to give those rules a name in YBT's palette: `carriage-raised`, `hairline-strong`, `chalk-muted`, `chalk-subtle` and `chalk-faint`. Each is a value YBT already showed as an opacity of an existing token, flattened so it has one name.

## The eight rules

1. **Three fills, by depth.** The page is `night`. The chrome, the panels and the table bodies are `carriage`. Fields, and a row under the pointer or selected, are `carriage-raised`. A table's header drops back to `night`. Nothing is lighter than `carriage-raised` except a `go` button.
2. **Two borders.** `hairline` goes round the chrome and the panels, and on small buttons. `hairline-strong` goes round anything shaped like a row or a field: table cells, inputs, checkboxes, the dialog, large buttons.
3. **Four text tones, in order.** `chalk` for titles, values, button labels and table headers. `chalk-muted` for table text. `chalk-subtle` for labels and captions. `chalk-faint` for inactive links, placeholders and muted actions. Never an opacity of `chalk` (`text-chalk/60`) for a tone.
4. **One primary action in a view or a dialog, and it is `go`.** Every other action is the outlined secondary button. `signal` is for negative figures, errors and the destructive action's text, and never fills a button. Links in data are `chalk`, never a colour of their own.
5. **Type is sized by role and ranked by weight**, with no capitals and no letter spacing, and nothing under 12px.
6. **Corners: `rounded` (4px) on controls, `rounded-lg` (8px) on the dialog, and none on anything else.** Panels, tables, the side bar, the top bar and the sheet are square. `rounded-full` only for what is round by nature: a radio, a person's initials, a spinner, a dot.
7. **No shadow but the dialog's and the sheet's, and no gradient.** Depth is fill and border.
8. **Spacing on the 4px grid.**

## Palette

| Token | Brand name | Role — use for | Never for |
|---|---|---|---|
| `night` | Night | The page; a table's header row; the dialog's panel; the scrim behind a dialog, a sheet or the phone drawer (`night/70`); the text on a `go` button | A panel or the chrome |
| `carriage` | Carriage | The chrome (side bar, top bar), panels, table bodies, the sheet | The page, a field |
| `carriage-raised` | Raised carriage | A field's fill; a row under the pointer or selected; the picked item in a list; a neutral badge's fill; a count beside a tab | A panel, a card, a button's fill |
| `hairline` | Hairline | The border of the chrome and the panels, the line under a panel header and under a tab row, a small button's border | A table cell, a field, the dialog |
| `hairline-strong` | Strong hairline | The border of anything row- or field-shaped: table cells, inputs, checkboxes, the dialog, large buttons; a secondary button's border on hover | The chrome, a panel |
| `chalk` | Chalk | Titles, values, button labels, table headers, money, links in data, the picked item | A label or a caption |
| `chalk-muted` | Muted chalk | Table text; ghost button labels | A title or a value |
| `chalk-subtle` | Subtle chalk | Labels, captions, the neutral badge, a tab's count, a side bar link not picked | Body copy a user must read to act |
| `chalk-faint` | Faint chalk | Placeholders, inactive tabs, muted and disabled actions, a field's hint | Anything a user must read |
| `go` | Go | The one primary action in a view or a dialog footer; the focus border of a field; the picked tab's underline; positive figures and the positive badge | Decoration, links, a second action in the same view |
| `signal` | Signal | The full stop in the YBT mark; negative figures; errors; the text of a destructive action; the negative badge | A button's fill, decoration |
| `caution` | Caution | Something that needs a look: the warning badge, a warning notice | An error, an action |
| `daylight` | Daylight | A status further along than neutral and not yet done (a project in maintenance); the map's food premises pins | An action, a link |
| `etch` | Etch | A status not started (a project in scoping); the map's unlisted pins | Text a user must read |
| `slate` | Slate | The map's dormant pins; the spinner's track | Text, a fill in the portal |
| `platform` | Platform | The map's trading place pins | The portal |
| `lilac`, `sky` | Lilac, Sky | The tax calculator's figure series (income tax, student loan) and their card icons, beside `go` and `caution` | A status, an action, text in the portal |
| `map-paper`, `map-ink`, `map-grid` | Map | The map's own paper | The portal |
| `tube-*` | Tube lines | The promo film's palette | The portal |
| `google-*` | Google | The Google sign-in button's mark, as Google requires | Anything else |

## Type

Two families, both YBT's own: **Space Grotesk** (`font-display`) for titles, figures, buttons, tabs, badges and the mark; **Inter** (`font-sans`, the body default) for everything a user reads or types: body copy, table text, labels, inputs, side bar links. Weight ranks within a size: Regular (400), Medium (500), Semibold (600). Tailwind's own leadings are kept.

| Token / class | Size · weight · line | Role |
|---|---|---|
| `font-display text-2xl font-semibold` | 24 · 600 · 32 | The dialog's title |
| `font-display text-2xl font-medium` | 24 · 500 · 32 | A headline figure |
| `font-display text-xl font-medium` | 20 · 500 · 28 | The page's heading in the top bar; a card's figure |
| `font-display text-lg font-semibold` | 18 · 600 · 28 | A panel's or a section's title; a section title inside a dialog |
| `text-base font-medium` | 16 · 500 · 24 | Field values; the organisation and project names in the pickers |
| `text-sm font-medium` | 14 · 500 · 20 | Labels; side bar links |
| `font-display text-sm font-medium` | 14 · 500 · 20 | Small button labels; tabs |
| `font-display text-base font-medium` | 16 · 500 · 24 | Large button labels |
| `text-sm font-semibold` | 14 · 600 · 20 | Table headers; the picked side bar link |
| `text-sm` | 14 · 400 · 20 | Body copy; table text |
| `text-xs font-medium` | 12 · 500 · 16 | Captions, hints, errors under a field; badges (`font-display`) |
| `font-display text-4xl`–`text-6xl` | 36–60 | The public pages' headlines only, never in the portal |

No `uppercase`, no `tracking-*`, no `text-[…]` size below `text-xs`.

## Spacing

Tailwind's 4px scale. The steps in use and what each is for:

| Step | Use |
|---|---|
| `1` (4) | Between a label and its control; inside a badge vertically (`py-0.5` is 2) |
| `2` (8) | Between buttons; a small button's vertical padding; a side bar row's vertical padding |
| `3` (12) | A table header cell's vertical padding; a field's vertical padding; a tab's padding |
| `4` (16) | A table cell's vertical padding; a small button's and a field's horizontal padding; the page gutter on a phone; a panel header's vertical padding; between fields side by side |
| `6` (24) | A panel's padding and its header's horizontal padding; a table cell's horizontal padding from `md`; between panels; the side bar's padding |
| `8` (32) | The dialog's padding; a large button's horizontal padding; the page gutter from `md`; between groups of fields |

## Radius · Elevation · Motion

**Radius.** `rounded` (4px): buttons, fields, checkboxes, badges, a tab's count, the pickers' toggles, a side bar row's hover fill. `rounded-lg` (8px): the dialog, a dropdown menu. `rounded-full`: radios, a person's initials, the spinner, a progress dot. Nothing else is rounded.

**Elevation.** `shadow-2xl` on the dialog and on the sheet, which are the only things that float. Nothing else carries a shadow; a dropdown menu is drawn with `hairline-strong` on `carriage`.

**Motion.** The tokens are in `src/lib/client/motion.ts`, every one easing out (`cubicOut`):

| Token | Duration | What it moves |
|---|---|---|
| `backdropFade` | 150 | A scrim fading in and out |
| `dialogRise` | 200, rises 12 | The dialog arriving |
| `sheetSlide` | 240, from 64 right | A sheet over a list |
| `menuDrop` | 150, drops 6 | A menu or a picker's list opening |
| `foldOpen` | 200 | A section folding open |
| `rowMove` | 250 | A row moving in a list |
| `tabSwap` | 150 | A tab's pane replacing the last |
| `viewEntrance` | 220, rises 10 | A view replacing the last |

What never animates: a figure changing, a colour flashing, anything bouncing or looping except the spinner.

## Unmapped

- **The phone drawer's slide has no motion token.** The Jewel portal slides it in 200ms, easing out. Proposed: a `drawerSlide` token (200, from the left) added to `motion.ts` when the frame is built.
- **The primary button's hover has no token.** YBT brightens it (`hover:brightness-110`); the Jewel portal has its own darker shade. Proposed: keep `hover:brightness-110`.
- **The Jewel portals' blue for links and neutral status has no YBT colour.** Proposed: no new colour; links in data are `chalk` with an underline on hover, and neutral status is the neutral badge.
- **The Jewel portals' tighter line heights** (14/16, 16/20) are not taken: they would move every line of every page. Tailwind's own leadings stay.
- **Opacities of `chalk` used as text tones** (`text-chalk/40` to `text-chalk/90`, about 600 places) map to the four tones: `/80` and `/90` are `chalk-muted`, `/70` is `chalk-subtle`, `/60` and below are `chalk-faint`. The widgets move first; the pages follow in the refactor rounds.
- **Tints** (`bg-go/10`, `bg-signal/10`, `bg-caution/10`) are kept as the badge's and the notice's fills: a tint of a tone, not a new colour.
- **The top bar's translucency** (`night/80` with a backdrop blur) is kept as the Jewel portal has it, so the page shows faintly as it scrolls under.
- **The public pages** (home, offer, case study) keep their large display type and their rounded marketing cards until a page of their own is designed; the rules above hold for everything a signed-in person sees.
