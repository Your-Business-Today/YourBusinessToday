# Your Business Today (YBT)

A consultancy that automates a business: we learn how a business really runs, then build
the tools that run it.

## Status

The consultancy runs on this: clients, projects and support are all working.
The books live in their own house, Your Books Today.

- Sign in with Google, or with an email address and a password — new accounts confirm
  their address by email, and a forgotten password is reset from the sign-in page;
  [docs/auth-setup.md](./docs/auth-setup.md) covers the provider configuration.
- Staff keep the client register at `/clients` — leads from the website land there, and a
  client moves through its lifecycle from lead to live;
  [docs/client-lifecycle-architecture.md](./docs/client-lifecycle-architecture.md) is the design.
- People at `/people` is the directory behind the register: who we know, where they work,
  what we last said to them, and a researched approach when we want to open a conversation;
  [docs/lead-generation-architecture.md](./docs/lead-generation-architecture.md) and
  [docs/prospector-architecture.md](./docs/prospector-architecture.md) cover finding them.
- A project belongs to its owner and is worked by its team. Anyone with an account
  creates projects they own; the owner invites people by email, removes them, and can hand
  the project on. Everyone on a project works its goals — high level, measurable — and its
  tasks, and every goal and task carries a conversation. `/projects` shows your projects
  and your team projects, each tile saying how much of its open work is assigned to you;
  `/tasks` is your queue across the projects you own, with an Assigned to me filter for every
  open task assigned to you on any project you are on. A project's backlog carries a chip per
  person with their open assigned count, so what is assigned to each of you is one click away.
  Anyone on a project can do all of this
  through their own Claude at `/api/mcp` too. Every top level task is a user story unless it
  is a `FIX:`; every message says whose turn it is next — a person or their Claude — and the
  backlog filters to what is waiting on you; every task records the git branch its work is on,
  and GitHub's pull request webhook marks it done when that branch merges. A task is sized for
  one Claude session, and a session that stops short raises the rest as tasks assigned to
  people and tells its person the chat can be archived;
  [docs/conversation-turns-and-branches.md](./docs/conversation-turns-and-branches.md) is the
  design. A task that cannot start until another is done waits for it, and a series of steps
  each waiting for the one before shows as a sequence on every step, with the step it is waiting
  for; [docs/task-sequences-architecture.md](./docs/task-sequences-architecture.md) is the design.
  `/projects/feed` is the live record of the work moving — every task raised, started, sent for
  review or done across your projects, as it happens — and the person a task was raised for is
  told on the bell when it is done;
  [docs/project-feed-architecture.md](./docs/project-feed-architecture.md) is the design.
- Every project is for an organisation — a client company such as Jewel Passive Fire Protection,
  invoiced as itself, or Your Business Today itself. Each organisation is one company. Staff
  create organisations at `/organisations`; a project manager on one brings people on by email,
  and everyone on an organisation is on every project under it, each new one included. The
  projects page filters by organisation;
  [docs/organisations-architecture.md](./docs/organisations-architecture.md) is the design.
- Support tasks are how a member raises something that needs an answer: find the goal,
  find or raise the task, post on it, read what is new in one call; the owner answers where
  the work is and closes it with a resolution the raiser reads. `/support` lists what is
  waiting on you; [docs/support-conversations-architecture.md](./docs/support-conversations-architecture.md)
  is the design.
- Every push to a project's default branch is a deploy YBT counts, and every N of them (set on
  the project, 10 by default) it raises `REFACTOR: round N` on the project as the reminder to run
  the repository's refactor-round skill from the project-process kit — a person's Claude runs it
  on a refactor/round-N branch and opens a pull request the person merges;
  [docs/refactor-cadence-architecture.md](./docs/refactor-cadence-architecture.md) is the design.
  The kit itself — the coding rules, the audit and gate, the bootstrap — lives in
  [project-process](https://github.com/jamesbeadle/project-process).
- A pull request merges by itself once GitHub's checks pass — the Claude that opens it enables
  auto-merge — and every migration file the merge adds is run on the live database by the
  repository's own GitHub workflow (Supabase here, Azure SQL on the portals), so nothing is left
  to run by hand.
- The MCP server at `/api/mcp` is the same product as the site: OAuth sign-in from the
  Connect button, every action gated by the caller's standing on each project;
  [docs/mcp-architecture.md](./docs/mcp-architecture.md) is the design.
- A business feeds its Your Business Brain from Microsoft 365 through its own Claude: the
  Microsoft 365 connector reads mail, SharePoint, OneDrive and Teams, and the Your Business
  Today connector files each piece with the link it came from, several pages to a call;
  [docs/connect-microsoft-365.md](./docs/connect-microsoft-365.md) is the walkthrough.
- Admins (`/admin`) can set the models that build each task, restrict accounts, and delete
  accounts. The site calls no AI model itself: every piece of AI work runs in the signed-in
  person's own Claude through the MCP server. The first admin is bootstrapped by email on signup.

The product this consultancy sells and implements — Knowledge Bases, the brains inside
them, chatbots, the marketplace and the hive mind — lives separately in
[YourBrainToday](https://github.com/jamesbeadle/YourBrainToday).

## Running locally

```bash
npm install
cp .env.example .env   # fill in the values below
npm run dev
```

| Variable | Purpose |
| --- | --- |
| `PUBLIC_SUPABASE_URL` | Supabase project URL |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable API key |
| `SUPABASE_SECRET_KEY` | Supabase secret key — used by the MCP server and to sign upload links |
| `COMPANIES_HOUSE_API_KEY` | Companies House company and officer search |
| `RESEND_API_KEY` / `EMAIL_FROM` | Resend API key and sender address for transactional email |
| `ENQUIRY_NOTIFICATION_EMAIL` | Where website enquiries from `/contact` are sent, and where staff are told a client has confirmed their company context |
| `GITHUB_WEBHOOK_SECRET` | Secret on the GitHub webhook that counts deploys and tells a task its pull request merged |
| `GITHUB_TOKEN` | Token that reads the project-process kit version of a private repository and, where a project has a deploy window, opens the staging-to-main pull request and turns auto-merge on — so it needs pull request write (`repo`) on every project repository with a window |
| `CRON_SECRET` | Bearer token the cron door (`/api/watch/<source>`) expects; Vercel sends it on its own crons, and the `deploy windows` workflow sends the GitHub secret of the same name every quarter hour |

## Stack

SvelteKit, Svelte 5, Tailwind CSS 4, TypeScript, Supabase (Auth + Postgres), Claude API.

All code follows the conventions in [CLAUDE.md](./CLAUDE.md).

<!-- code-quality:start -->
## Code quality

<table><tr><td align="center">
<strong>Code quality score</strong><h2>96.5%</h2>
<sub>measured 2026-11-10 · project-process kit 1.41.0</sub>
</td></tr></table>

3,425 files · backend 943 · frontend 752 · shared 575 · tests 403 · api 370 · database 177 · tooling 123 · docs 65 · infrastructure 17

The site by route: 49 routes, 510 components, 35 pieces of markup written by hand where a widget should be — [`tools/refactor/site-definition.md`](tools/refactor/site-definition.md), refreshed alone by *"Run the widget identification"*.

Brand and widget designs: brand checked never, 4 widget sheets checked never — say *"Check the site against the brand"* or *"Check the widgets against their designs"* (the `widget-design` skill; every widget's standing is in [`tools/refactor/site-definition.md`](tools/refactor/site-definition.md)).

<details>
<summary><strong>How the 96.5% is made up</strong></summary>

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **99.9%** | **52** | |
| Files over the line limit | 0 in 2888 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 4251 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 4263 branches | 100.0% | 5 | 50% of branches |
| Duplication % | not measured | not measured | — | 20 |
| Explanatory comment lines | 0 in 106.52 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 6 in 106.52 thousand lines | 99.7% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 4765 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 0 in 106.52 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 106.52 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 4251 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **97.3%** | **10** | |
| Files the patterns predict but are missing | 2 in 146 predicted files | 97.3% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **99.8%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 4263 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 4263 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 3 in 4251 functions | 99.3% | 6 | 10% of functions |
| **Widget adoption** | | **61.7%** | **8** | |
| Markup written by hand where a widget should be | 35 in 183 widget slots | 61.7% | 8 | 50% of widget slots |
| **Input validation** | | **100.0%** | **8** | |
| Doors that write without checking their input against the columns | 0 in 253 write doors | 100.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

</details>

<details>
<summary><strong>The repository by area: 3,425 files</strong></summary>

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| backend | 943 | 933 | 30,387 |
| frontend | 752 | 622 | 21,238 |
| shared | 575 | 561 | 19,677 |
| tests | 403 | 388 | 17,343 |
| api | 370 | 369 | 17,322 |
| database | 177 | 7 | 212 |
| tooling | 123 | 8 | 344 |
| docs | 65 | 0 | 0 |
| infrastructure | 17 | 0 | 0 |
| **whole repository** | **3,425** | **2,888** | **106,523** |

</details>

<details>
<summary><strong>The refactoring plan: 15 steps, in order</strong></summary>

**Pass 1 — Widget adoption**

1. Adopt `FormField` in 4 file(s) that write its markup by hand. 7 place(s): `src/lib/components/clients/map/AreaSearchForm.svelte` (3), `src/lib/components/organisations/OrganisationDetailsFields.svelte` (2), `src/lib/components/admin/PointsSelect.svelte`, `src/lib/components/admin/ReviewModelForm.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.
2. Adopt `FormField` in 4 file(s) that write its markup by hand. 4 place(s): `src/lib/components/clients/AskClaudeToResearch.svelte`, `src/lib/components/clients/ProspectSearchForm.svelte`, `src/lib/components/contact/DiscoveryCallForm.svelte`, `src/lib/components/conversations/HandOffPicker.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.
3. Adopt `FormField` in 4 file(s) that write its markup by hand. 4 place(s): `src/lib/components/organisations/NameDirectorForm.svelte`, `src/lib/components/people/AppointmentImportForm.svelte`, `src/lib/components/projects/DeployHistoryFilterBar.svelte`, `src/lib/components/projects/TaskComplexityCount.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.
4. Adopt `FormField` in 4 file(s) that write its markup by hand. 4 place(s): `src/lib/components/projects/UserStoryFields.svelte`, `src/lib/components/taxCalculator/LivingCostsCard.svelte`, `src/lib/components/taxCalculator/MileageAndHomeFields.svelte`, `src/lib/components/taxCalculator/PensionField.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.
5. Adopt `FormField` in 4 file(s) that write its markup by hand. 4 place(s): `src/lib/components/taxCalculator/StudentLoanFields.svelte`, `src/lib/components/taxCalculator/TaxRegionField.svelte`, `src/lib/components/taxCalculator/TaxYearSelect.svelte`, `src/lib/components/taxCalculator/WhatIfCard.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.
6. Adopt `PageTitle` in 4 file(s) that write its markup by hand. 4 place(s): `src/lib/components/about/AboutStorySection.svelte`, `src/lib/components/case-study/CaseStudyIntroSection.svelte`, `src/lib/components/demo/DemoConnectSection.svelte`, `src/lib/components/demo/DemoStartSection.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.
7. Adopt `PageTitle` in 4 file(s) that write its markup by hand. 4 place(s): `src/lib/components/home/HeroSection.svelte`, `src/lib/components/offer/OfferStepsSection.svelte`, `src/lib/components/promo/PromoIntro.svelte`, `src/lib/components/site/LegalArticle.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.
8. Adopt `PageTitle` in 3 file(s) that write its markup by hand. 3 place(s): `src/lib/components/taxCalculator/CalculatorHero.svelte`, `src/lib/components/workspace/WorkspaceHeader.svelte`, `src/routes/contact/+page.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.
9. Build, from the best of these, then adopt `RecordsTable` in 1 file(s) that write its markup by hand. 1 place(s): `src/lib/components/taxCalculator/BreakdownTable.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.

**Pass 3 — Utility function identification**

10. Give `decayingLevel / fadingLevel` one home. The same function, word for word: 6 lines, identical in 2 files: src/lib/promo/sound/drumVoices.ts, src/lib/promo/sound/effectVoices.ts. Evidence: 0/2 bound from their own markup, 0/2 framework-invoked, 0/2 imported elsewhere.

… and 5 more steps. The whole plan, with the measured detail, is in [`tools/refactor/refactor-plan.md`](tools/refactor/refactor-plan.md).

</details>

<!-- code-quality:end -->
