# PortalFrame — design
Source: the Jewel Bespoke Build portal's frame, read only in `Your-Business-Today/jewel-portal` (`jpms/Layout/MainLayout.razor`, `NavigationDrawer.razor`, `SideNav*.razor`, `SideNavProjectPicker.razor`, `jpms/Styles/app.tailwind.css`), and James's portal journey of 10 Nov 2026; read 10 Nov 2026. Read from code: values are the Jewel portal's classes, mapped to YBT's tokens.

The frame every signed-in person sees round every page: the side bar, the top bar and the page. It is a container widget: it draws the side bar's and the top bar's boxes and nothing inside the page. The next task ("Everyone signed in sees one portal") builds it.

## Anatomy
- **Side bar**, fixed down the left, top to bottom:
  1. **The mark**: the YBT wordmark (`BrandWordmark`, its full stop in `signal`) and "Your Business Today", linking home; beside it the collapse button.
  2. **Organisation picker**: as wide as the side bar. Shows the picked organisation; opens a list of the person's organisations.
  3. **Navigation**, which scrolls: the picked organisation's pages (Overview, Projects, its modules), then the links that stand alone.
  4. **Who is signed in**: their initials (`PersonInitials`) and name, and Sign out.
- **Top bar**, across the top of the page and staying there: on a phone the menu button, then the trail on the left; the bell (`NotificationsBell`) on the right.
- **The trail** says where the page is: the picked organisation (a link to its first page), then the section. On a project's page the section is a link too, and the trail ends with the **project switcher**: the project's name with a selector mark, opening a list of the organisation's projects. On a phone only the trail's last part shows.
- **The page**, under the top bar, with the page gutter.
- **On a phone**, the side bar is a drawer over a scrim.

## Tokens
- Side bar: `bg-carriage`, `border-r border-hairline`; `w-64` (256) expanded, `w-16` (64) as a rail of icons; padding `px-4 py-6`, `gap-6` between the mark, the pickers and the navigation.
- Picker toggle (the organisation, as a field): `w-full rounded border border-hairline bg-carriage-raised px-3 py-2`, hover `border-hairline-strong`; the picked name `text-sm font-semibold text-chalk` truncated, a caption above it `text-xs text-chalk-subtle`; the selector mark (up and down) 16, `text-chalk-faint`.
- Picker toggle (the project, as a crumb): no border and no fill, `rounded px-1.5 py-1.5`, hover `bg-carriage-raised`; the name `font-display text-sm font-medium text-chalk` truncated; the same selector mark; its caption is for screen readers only. Its list is `w-72`, from the toggle's left edge.
- Picker list: `rounded-lg border border-hairline-strong bg-carriage`, as wide as its toggle, `max-h-80` scrolling; group labels ("Recent", "All projects") `text-sm font-medium text-chalk-subtle px-3 pt-2 pb-1`; an item `px-3 py-2 text-sm text-chalk-muted`, hover `text-chalk bg-carriage-raised`; the picked item `bg-carriage-raised text-chalk font-semibold`; a `border-t border-hairline` between groups.
- Navigation link: `flex items-center gap-3 rounded px-3 py-3.5 md:py-2 text-sm font-medium text-chalk-subtle`, icon 20; hover `text-chalk bg-carriage-raised`; the current page `text-chalk font-semibold`. Folder headings as a link, with a chevron.
- Who is signed in: `border-t border-hairline pt-4`, name `text-sm font-medium text-chalk-subtle`, Sign out a ghost button.
- Top bar: `sticky top-0 z-30 h-14` (56), `bg-night/80 backdrop-blur border-b border-hairline`, `px-4 sm:px-6` so the trail starts where the page's title does.
- Trail: `font-display text-sm`, `gap-2`; a crumb `text-chalk-faint`, hover `text-chalk`; the separator `/` in `hairline-strong`; the page's own heading `font-medium text-chalk` truncated.
- Page: offset `md:pl-64` (or `md:pl-16` as a rail); gutter `px-4 md:px-8`, `py-6`.
- Drawer (below `md`): `w-72 max-w-[85vw]`, `bg-carriage border-r border-hairline`, `fixed inset-y-0 left-0 z-40`; scrim `fixed inset-0 z-40 bg-night/70`; padded for the phone's home bar (`env(safe-area-inset-bottom)`).

## States
- default: expanded side bar from `md` up; drawer closed below `md`.
- hover: link and picker item take `carriage-raised`; toggle border to `hairline-strong`.
- active/selected: the current page's link `chalk` semibold; the picked organisation and project shown in their toggles and marked in their lists (`aria-selected`).
- collapsed: the rail shows icons alone, each named by its title on hover; the pickers show the organisation's initials and the project's reference.
- disabled: a link the person cannot open is `chalk-faint` and does nothing.
- loading: the pickers keep the last pick shown while the lists load.
- empty: an organisation with no project shows "No projects yet" in the project toggle, `chalk-faint`; a person with one organisation still sees the organisation picker, holding one.
- error: not shown.

## Variants
- Expanded (256) or rail (64), the person's choice, remembered.
- Phone drawer: the same side bar, labelled, over the scrim.

## Behaviour
- The organisation picker defaults to the organisation last picked, else the first, and the pick is remembered for the person. Picking an organisation opens its Projects page.
- The project switcher lists the picked organisation's projects, and the open one even when it sits elsewhere. Switching keeps the same tab, and lands on the board from a task or a goal.
- The drawer opens from the top bar's menu button, slides in from the left (`drawerSlide`, 200), takes the keyboard's focus, and closes on a pick, on its X, on a press on the scrim and on Back.
- A picker's list opens with `menuDrop`, closes on a pick, on Escape and on a press outside, without swallowing that press.
- Every row is 44px tall on a phone (`py-3.5`), a thumb's target.

## Exceptions
- The project picker left the side bar for the top bar's trail, and the heading became the trail (James, 11 Nov 2026): the side bar is the organisation's, and a project is switched where its page says which project it is. A project's own pages are the tabs at the foot of its page header, not side bar links.

## Unmapped
- The Jewel portal shows the project's reference in a monospaced font; YBT has no monospaced token, so the caption is `text-xs text-chalk-subtle` in Inter.
- The Jewel portal's side bar is 240 in its design and 256 in its code; the code's 256 is taken.
