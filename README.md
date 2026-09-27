# Your Business Today (YBT)

A consultancy that automates a business: we learn how a business really runs, then build
the tools that run it.

## Status

The consultancy runs on this: clients, projects, support and the Builder are all working.
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
  and your team projects; `/tasks` is your queue across the projects you own, with a Team
  filter for what is assigned to you elsewhere. Anyone on a project can do all of this
  through their own Claude at `/api/mcp` too. Every top level task is a user story unless it
  is a `FIX:`; every message says whose turn it is next — a person or their Claude — and the
  backlog filters to what is waiting on you; every task records the git branch its work is on,
  and GitHub's pull request webhook marks it done when that branch merges;
  [docs/conversation-turns-and-branches.md](./docs/conversation-turns-and-branches.md) is the
  design.
- Support tasks are how a member raises something that needs an answer: find the goal,
  find or raise the task, post on it, read what is new in one call; the owner answers where
  the work is and closes it with a resolution the raiser reads. `/support` lists what is
  waiting on you; [docs/support-conversations-architecture.md](./docs/support-conversations-architecture.md)
  is the design.
- Send a task to the Builder — a Claude Code routine per tier that branches, builds, opens
  a pull request and reports back; merged builds mark the task live and say so in its
  conversation. Schema changes wait for a person;
  [docs/builder-architecture.md](./docs/builder-architecture.md) is the design.
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
| `SUPABASE_SECRET_KEY` | Supabase secret key — used by the MCP server and to read the site model |
| `COMPANIES_HOUSE_API_KEY` | Companies House company and officer search |
| `RESEND_API_KEY` / `EMAIL_FROM` | Resend API key and sender address for transactional email |
| `ENQUIRY_NOTIFICATION_EMAIL` | Where website enquiries from `/contact` are sent |
| `BUILDER_{EASY,MEDIUM,HARD}_ROUTINE_URL` / `_TOKEN` | Fire endpoint and token of the Claude Code routine for each tier |
| `GITHUB_WEBHOOK_SECRET` | Secret on the GitHub webhook that tells a task its build merged |

## Stack

SvelteKit, Svelte 5, Tailwind CSS 4, TypeScript, Supabase (Auth + Postgres), Claude API.

All code follows the conventions in [CLAUDE.md](./CLAUDE.md).
