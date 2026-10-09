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
  and GitHub's pull request webhook marks it done when that branch merges;
  [docs/conversation-turns-and-branches.md](./docs/conversation-turns-and-branches.md) is the
  design. A task that cannot start until another is done waits for it, and a series of steps
  each waiting for the one before shows as a sequence on every step, with the step it is waiting
  for; [docs/task-sequences-architecture.md](./docs/task-sequences-architecture.md) is the design.
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
<strong>Code quality score</strong><h2>87.7%</h2>
<sub>measured 2026-10-06 · project-process kit 1.14.0</sub>
</td></tr></table>

1,307 files · frontend 405 · backend 386 · shared 120 · api 105 · tooling 102 · database 70 · tests 57 · docs 49 · infrastructure 13

<details>
<summary><strong>How the 87.7% is made up</strong></summary>

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **97.0%** | **60** | |
| Files over the line limit | 0 in 946 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 4 in 1122 functions | 98.6% | 8 | 25% of functions |
| Else blocks | 0 in 1463 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0.19 | 99.1% | 8 | 20 |
| Explanatory comment lines | 78 in 33.42 thousand lines | 95.3% | 4 | 50 per thousand lines |
| Inline magic values | 35 in 33.42 thousand lines | 94.8% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 1351 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 201 in 33.42 thousand lines | 80.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 89 in 33.42 thousand lines | 91.1% | 4 | 30 per thousand lines |
| Overlong function names | 2 in 1122 functions | 98.2% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 47 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **88.7%** | **20** | |
| Conditions with calls tangled inside calls | 25 in 1463 branches | 93.2% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 1463 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 32 in 1122 functions | 71.5% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 95 in 95 write doors | 0.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

</details>

<details>
<summary><strong>The repository by area: 1,307 files</strong></summary>

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| frontend | 405 | 282 | 11,165 |
| backend | 386 | 383 | 11,682 |
| shared | 120 | 119 | 3,763 |
| api | 105 | 105 | 4,872 |
| tooling | 102 | 0 | 0 |
| database | 70 | 0 | 0 |
| tests | 57 | 57 | 1,941 |
| docs | 49 | 0 | 0 |
| infrastructure | 13 | 0 | 0 |
| **whole repository** | **1,307** | **946** | **33,423** |

</details>

<details>
<summary><strong>The refactoring plan: 13 steps, in order</strong></summary>

**Pass 4 — Design pattern identification**

1. Complete the pattern: every status has a actions. 1 of 4 lack it. Predicted: src/lib/server/projects/updateTaskActions.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
2. Complete the pattern: every status has a record. 1 of 4 lack it. Predicted: src/lib/server/projects/updateTaskRecord.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
3. Complete the pattern: every goal has a project. 2 of 8 lack it. Predicted: src/lib/server/goals/updateProject.ts; src/lib/server/projects/updateTaskProject.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
4. Complete the pattern: every goal has a task. 2 of 8 lack it. Predicted: src/lib/server/goals/updateTask.ts; src/lib/server/projects/updateTaskTask.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.

**Pass 5 — The sweep to zero**

5. Accessor names that want to be a property: 32 to zero. Scores 71.5% at weight 6; the offenders are in audit.json under details.accessorNames, fifty at a time.
6. Long member chain lines: 201 to zero. Scores 80.0% at weight 4; the offenders are in audit.json under details.prose, fifty at a time.
7. Deeply indented lines: 89 to zero. Scores 91.1% at weight 4; the offenders are in audit.json under details.prose, fifty at a time.
8. Conditions with calls tangled inside calls: 25 to zero. Scores 93.2% at weight 8; the offenders are in audit.json under details.conditions, fifty at a time.
9. Inline magic values: 35 to zero. Scores 94.8% at weight 4; the offenders are in audit.json under details.magicValues, fifty at a time.
10. Explanatory comment lines: 78 to zero. Scores 95.3% at weight 4; the offenders are in audit.json under details.comments, fifty at a time.

… and 3 more steps. The whole plan, with the measured detail, is in [`tools/refactor/refactor-plan.md`](tools/refactor/refactor-plan.md).

</details>

<!-- code-quality:end -->
