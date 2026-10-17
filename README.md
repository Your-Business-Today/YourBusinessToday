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
- Every project is for an organisation — a client such as Jewel Enterprises, with its businesses
  as sub-organisations that can be invoiced on their own, or Your Business Today itself. Staff
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
- Admins (`/admin`) can set the site model — the Claude model behind every agent reply —
  restrict accounts, and delete accounts. The first admin is bootstrapped by email on signup.

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
| `ANTHROPIC_API_KEY` | Claude API key — company and person research, and drafted approaches |
| `SUPABASE_SECRET_KEY` | Supabase secret key — used by the MCP server, to read the site model, and to sign upload links |
| `COMPANIES_HOUSE_API_KEY` | Companies House company and officer search |
| `RESEND_API_KEY` / `EMAIL_FROM` | Resend API key and sender address for transactional email |
| `ENQUIRY_NOTIFICATION_EMAIL` | Where website enquiries from `/contact` are sent |
| `GITHUB_WEBHOOK_SECRET` | Secret on the GitHub webhook that counts deploys and tells a task its pull request merged |
| `GITHUB_TOKEN` | Optional read-only (contents) token so the project-process kit version of a private repository can be read; public ones need none |

## Stack

SvelteKit, Svelte 5, Tailwind CSS 4, TypeScript, Supabase (Auth + Postgres), Claude API.

All code follows the conventions in [CLAUDE.md](./CLAUDE.md).

<!-- code-quality:start -->
## Code quality

<table><tr><td align="center">
<strong>Code quality score</strong><h2>91.8%</h2>
<sub>measured 2026-10-17 · project-process kit 1.19.0</sub>
</td></tr></table>

2,192 files · backend 695 · frontend 616 · shared 258 · api 165 · tests 157 · tooling 117 · database 113 · docs 57 · infrastructure 14

<details>
<summary><strong>How the 91.8% is made up</strong></summary>

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **100.0%** | **60** | |
| Files over the line limit | 0 in 1741 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 2285 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 2627 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0 | 100.0% | 8 | 20 |
| Explanatory comment lines | 0 in 61.1 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 0 in 61.1 thousand lines | 100.0% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 2686 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 0 in 61.1 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 61.1 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 2285 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 104 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 2627 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 2627 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 2285 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 75 in 142 write doors | 0.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

</details>

<details>
<summary><strong>The repository by area: 2,192 files</strong></summary>

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| backend | 695 | 685 | 21,831 |
| frontend | 616 | 492 | 17,257 |
| shared | 258 | 244 | 7,879 |
| api | 165 | 165 | 7,929 |
| tests | 157 | 150 | 6,067 |
| tooling | 117 | 5 | 138 |
| database | 113 | 0 | 0 |
| docs | 57 | 0 | 0 |
| infrastructure | 14 | 0 | 0 |
| **whole repository** | **2,192** | **1,741** | **61,101** |

</details>

<details>
<summary><strong>The refactoring plan: 0 steps, in order</strong></summary>

Nothing is left to refactor: every figure is at zero.

</details>

<!-- code-quality:end -->
