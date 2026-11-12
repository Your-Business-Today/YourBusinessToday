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
  tasks, and every goal and task carries a conversation. `/projects` shows the projects
  you own and the ones you are on as one list in your own order, each row saying how much
  of its open work is assigned to you;
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

Your Business Brain is each organisation's private knowledge base, kept here in YBT under the
Knowledge folder of the side nav: its pages and source files, the brains of its products, and
the chatbots that are read-only doors onto it. It replaced the separate Your Brain Today, which
is switched off; nothing was copied from it.

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
<strong>Code quality score</strong><h2>99.4%</h2>
<sub>measured 2026-11-11 · project-process kit 1.41.0</sub>
</td></tr></table>

4,336 files · backend 1,168 · frontend 909 · shared 788 · tests 558 · api 478 · database 200 · tooling 141 · docs 77 · infrastructure 17

The site by route: 63 routes, 613 components, 8 pieces of markup written by hand where a widget should be — [`tools/refactor/site-definition.md`](tools/refactor/site-definition.md), refreshed alone by *"Run the widget identification"*.

Brand and widget designs: brand checked never, 7 widget sheets checked 2026-11-10 — say *"Check the site against the brand"* or *"Check the widgets against their designs"* (the `widget-design` skill; every widget's standing is in [`tools/refactor/site-definition.md`](tools/refactor/site-definition.md)).

<details>
<summary><strong>How the 99.4% is made up</strong></summary>

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **99.7%** | **60** | |
| Files over the line limit | 0 in 3743 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 5628 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 5459 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0.46 | 97.7% | 8 | 20 |
| Explanatory comment lines | 0 in 140.11 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 6 in 140.11 thousand lines | 99.8% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 6248 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 0 in 140.11 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 140.11 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 5628 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 229 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 5459 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 5459 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 5628 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **94.8%** | **8** | |
| Markup written by hand where a widget should be | 8 in 306 widget slots | 94.8% | 8 | 50% of widget slots |
| **Input validation** | | **100.0%** | **8** | |
| Doors that write without checking their input against the columns | 0 in 312 write doors | 100.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

</details>

<details>
<summary><strong>The repository by area: 4,336 files</strong></summary>

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| backend | 1,168 | 1,158 | 38,340 |
| frontend | 909 | 779 | 26,150 |
| shared | 788 | 770 | 27,734 |
| tests | 558 | 543 | 25,282 |
| api | 478 | 477 | 22,013 |
| database | 200 | 7 | 212 |
| tooling | 141 | 9 | 382 |
| docs | 77 | 0 | 0 |
| infrastructure | 17 | 0 | 0 |
| **whole repository** | **4,336** | **3,743** | **140,113** |

</details>

<details>
<summary><strong>The refactoring plan: 6 steps, in order</strong></summary>

**Pass 1 — Widget adoption**

1. Adopt `FormField` in 4 file(s) that write its markup by hand. 4 place(s): `src/lib/components/admin/PointsSelect.svelte`, `src/lib/components/contact/DiscoveryCallForm.svelte`, `src/lib/components/organisations/NameDirectorForm.svelte`, `src/lib/components/projects/DeployHistoryFilterBar.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.
2. Adopt `FormField` in 2 file(s) that write its markup by hand. 2 place(s): `src/lib/components/taxCalculator/DeadlinesEmailCard.svelte`, `src/lib/components/taxCalculator/TaxYearSelect.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.
3. Adopt `PageTitle` in 1 file(s) that write its markup by hand. 1 place(s): `src/lib/components/workspace/WorkspaceHeader.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.
4. Adopt `RecordsTable` in 1 file(s) that write its markup by hand. 1 place(s): `src/lib/components/taxCalculator/BreakdownTable.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.

**Pass 5 — The sweep to zero**

5. Duplication %: 0.46 to zero. Scores 97.7% at weight 8; the offenders are in audit.json under details.duplication, fifty at a time.
6. Inline magic values: 6 to zero. Scores 99.8% at weight 4; the offenders are in audit.json under details.magicValues, fifty at a time.

The whole plan, with the measured detail, is in [`tools/refactor/refactor-plan.md`](tools/refactor/refactor-plan.md).

</details>

<!-- code-quality:end -->
