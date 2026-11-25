---
name: project-setup
description: Set up a new project by its type — decide first whether it is a business portal (the portal template, Blazor on Azure) or a high volume SaaS (SvelteKit, Tailwind and TypeScript on Vercel and Supabase), then carry out that type's setup rather than inventing one. For a SaaS, Claude does the setup itself, through the supabase, vercel and gh CLIs signed in beside Claude Desktop or through the Vercel and Supabase connectors, and asks the person only for what needs their own sign-in. Use when the person says "Set up the project", "set up a new project", "add the project process" to a repository with no site in it yet, "set up Supabase and Vercel", or names a domain and asks for a new site to be made ready. Not for a repository that already runs: the bootstrap alone refreshes the kit there.
---

# Setting up a new project

A new project is set up the way the others were, never a way thought up for it. The person has set this up before and does not want to again: every step below is one Claude does, and the person is asked only for a sign-in or a record at their registrar.

## Before anything: four rules this skill exists for

Each was broken on the day Your Boat Today was set up (22/11/2026), and each cost the person an afternoon.

1. **"The project process" is this kit.** *Add the project process* means run its bootstrap and follow its `CLAUDE.md`. It never means write a process: no `CLAUDE.md` of your own, no workflow of your own, no checklist of your own. Where the kit does not cover something, read how the reference project does it (section 3) and copy that.
2. **One Supabase project for one app.** Never a second one for staging, previews or tests, and never offered as a choice. None of the person's projects has two.
3. **The work is tasked in Your Business Today.** Goals and user stories on the project there, never GitHub issues or milestones.
4. **Say what exists only after reading it.** A run that was stopped, or a machine that went offline, may have created the thing before it stopped. Before saying *nothing was created*, and before creating anything, list what is there (`supabase projects list`, the Vercel project's variables, `gh secret list`) and report what the list says. A session once told the person an interrupted run had created nothing; it had created the Supabase project.

## 1. Decide the type first

Every project is one of two types, and the type decides the stack, the hosting and the steps. Decide it before the bootstrap runs and before any file is written.

| | Business portal | High volume SaaS |
| --- | --- | --- |
| What it is | A company's own back office: its staff, its jobs, its registers | A product anyone can sign up to, built for many users |
| Stack | Blazor and .NET, on the portal template | SvelteKit, Tailwind and TypeScript |
| Hosting | Azure, with Azure SQL | Vercel, with one Supabase project |
| Bootstrap | `--type portal` | `--type saas` |
| Carry on at | section 2 | section 3 |

Where the person has said which it is, in these words or plainly meaning them (*a portal for the company*, *a SaaS*, *on Vercel and Supabase*), take it. Where they have not, ask once, with both rows in the kit's words, and wait: the type is the one thing here that is theirs to choose. Never infer it from an old repository they pointed at, and never pick a third stack (Next.js, pnpm, a different host) because it is familiar.

Write the type as the first line under *How it is built* in the repository's `PROJECT.md`, so no later session asks again.

## 2. A business portal

A portal is the portal template (`jamesbeadle/portal-template`) with its company's domain added, and that path is already complete: the template's own instructions carry the Azure setup, its migrations and the register of sibling portals (`portals/portals.json`). Start from the template as its instructions say, run this kit's bootstrap with `--type portal`, and follow *A repository built on a template carries a template change to its siblings* in `CLAUDE.md`. Nothing in section 3 applies.

## 3. A high volume SaaS

The reference project is `Your-Business-Today/carp-mania`. Read its `PROJECT.md`, `SETUP.md`, `package.json`, `svelte.config.js` and `src/lib` before writing anything, and lay the new repository out the same way. Your Boat Today (`Your-Business-Today/YourBoatToday`) is the second example, and the newest.

### 3.1 Make sure Claude can reach the services

The setup touches Supabase, Vercel and GitHub settings, and a cloud session on its own reaches none of them: its GitHub access cannot change repository settings or secrets. So before the first step, find a route and say which one is in use.

- **Claude Desktop beside the CLIs.** The person's Mac has `supabase`, `vercel` and `gh` signed in. Work there (a session started in Claude Desktop, or a cloud thread linked to it by Remote Control) and check each: `supabase projects list`, `vercel whoami`, `gh auth status`. This route does every step below, and it works from every Claude licence because the sign-ins are the Mac's.
- **The connectors.** The Vercel and Supabase connectors, connected to Claude, do the Vercel and Supabase steps from any session. They are an account's setting, so they are connected once on each licence. The GitHub settings and the secret still need `gh` on the Mac.

Where neither is reachable, ask for one in a single message and carry on with section 3.2, which needs neither:

> To set this up myself I need one of two things. Either open this project in Claude Desktop on the Mac where `supabase`, `vercel` and `gh` are signed in, and allow me to work there. Or connect the Vercel and Supabase connectors to Claude. Which would you rather?

Do not write the person a checklist of dashboard steps instead. A list of steps for them to click through is the outcome this skill is here to prevent.

### 3.2 The repository

1. SvelteKit 2 with Svelte 5, TypeScript and Tailwind 4, with npm on Node 22, and `@sveltejs/adapter-vercel`. Routes in `src/routes`, components in `src/lib/components`, the Supabase clients in `src/lib/supabase`, the server's commands, queries and gates in `src/lib/server`, and the sign-in return at `src/routes/auth/callback`.
2. `.env.example` names `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`. `SUPABASE_SERVICE_ROLE_KEY` is read by the server alone and is never given a `PUBLIC_` prefix.
3. Run the bootstrap: `bash bootstrap.sh --type saas`. It installs the kit on the `sveltekit` stack with the workflow that runs migrations.
4. Migrations are `supabase/migrations/0001_tables.sql`, `0002_policies.sql` and so on. Every table has row level security turned on, and its policies written, in the migrations that make it. They run themselves on a merge, through the repository secret `SUPABASE_DB_URL` (section 3.5); nobody runs one by hand.
5. Make `scripts/check-before-push.sh` run what the required check runs: the audit's tests, `npm ci`, `npm run check` and `npm run build`. The organisation's ruleset requires a check named exactly **Run test suite** on every pull request, and the kit's workflow reports it; a job under any other name leaves every pull request unable to merge.
6. Write `PROJECT.md`: what the product is, the type, how it is built, the one database, where it is hosted and the domain.
7. All of it on a branch, as a pull request that merges at green, as `CLAUDE.md` says.

### 3.3 Your Business Today

On the project there (`update_project_details`): the repository's address, its default branch and the live address. The product's plan is raised as goals with user stories under them, each story with the chunks it will be built in as its subtasks, read back to the person once before it is created. This setup is itself a task on the project, and its work log is where the facts in section 3.9 are written.

### 3.4 Supabase: the one project

1. List first: `supabase projects list`. A project already named for the app is reused, whatever any earlier message said about it.
2. Otherwise create exactly one: named for the app in lower case with no spaces (`yourboattoday`), in the person's organisation, in London (`eu-west-2`).
3. Its database password is made on the Mac, of letters and digits only so it needs no encoding in a connection string, and saved in the macOS keychain **before** the project is created, as the item `<app>-db-password`: `security add-generic-password -a <app> -s <app>-db-password -w "$PASSWORD" -U`. A password that exists only in a shell variable is lost when the session stops.
4. Wait until the project reports healthy, and note its ref. The ref and the address `https://<ref>.supabase.co` are not secret.

The organisation is on a paid plan, so a project costs money each month. One project is what the person asked for when they asked for the app, so it is created without asking again; a second one is never created.

### 3.5 Vercel, and the secret that runs migrations

1. The Vercel project is named for the app, connected to the repository, with the framework SvelteKit. The apex domain and `www` are both added to it, and `www` redirects to the apex.
2. Three variables, each value piped in and never typed where it is echoed:

   | Variable | Production | Preview | Development |
   | --- | --- | --- | --- |
   | `PUBLIC_SUPABASE_URL` | yes | yes | yes |
   | `PUBLIC_SUPABASE_ANON_KEY` | yes | yes | yes |
   | `SUPABASE_SERVICE_ROLE_KEY`, marked sensitive | yes | yes | no |

   Vercel does not hold a sensitive value for Development, which is why the last is on two. All three environments read the one Supabase project.
3. `./setup-vercel.sh --team <team> <project>` from this kit, naming the project so no other is touched: it turns off the Vercel app's comments on pull requests and commits.
4. The repository secret `SUPABASE_DB_URL` is the project's **session pooler** connection string: port 5432, the user `postgres.<ref>`, the database `postgres`, with the password from the keychain in it. The direct `db.<ref>.supabase.co` address answers on IPv6 only, and GitHub's runners cannot reach it. Test it where `psql` is installed (`select 1` answers 1), then store it with `gh secret set SUPABASE_DB_URL --repo <owner>/<repository>`, the value read from standard input.

### 3.6 Supabase sign-in addresses

The project's site URL is the live domain, `https://<domain>`. The addresses a sign-in may return to are exactly two: `https://<domain>/auth/callback` and `http://localhost:5173/auth/callback`. Set them through the connector, or the Management API's auth settings for the project (`site_url` and `uri_allow_list`), and change nothing else there. Never `supabase config push`: it pushes every other local setting with them.

### 3.7 GitHub

`./setup-github.sh <owner>/<repository>` from this kit: it allows auto-merge, deletes a branch once it has merged, and says whether the ruleset requires *Run test suite* on the default branch. Where it says the check is not required, say so to the person once; the ruleset is the organisation's.

### 3.8 The domain

The domain is registered at GoDaddy, and its records are the one step that is the person's, unless a route to the registrar is at hand. Read the values from the Vercel project's domain settings and give the person exactly two changes:

- `A`, name `@`: the address Vercel names (`216.150.1.1` for Your Boat Today). It replaces GoDaddy's *Parked* record.
- `CNAME`, name `www`: the target Vercel gives for this project (it ends `vercel-dns-….com`, and differs from project to project).

The `NS`, `SOA`, `_domainconnect` and `_dmarc` records stay as they are. When the person says it is done, read the domain back from Vercel, which reports each as correctly configured; Vercel issues the certificate itself a few minutes later.

### 3.9 Read it all back, then tie off

Nothing is reported done from what a command was told to do. Read each one back, and report what the reading says:

| What | Read with |
| --- | --- |
| The one Supabase project, its ref and region | `supabase projects list` |
| The three Vercel variables and their environments | `vercel env ls` (names only) |
| Comments off | the answer `setup-vercel.sh` prints |
| The migration secret | `gh secret list` |
| Auto-merge, branches deleted, the required check | the answer `setup-github.sh` prints |
| The sign-in addresses | the project's auth settings |
| The domain | the Vercel project's domains |

Then write what a later session will need into the repository's `PROJECT.md` and the task's work log, never only into one Claude account's memory: the Supabase project's name, ref and region, the keychain item that holds its password, the Vercel project and team, and the domain. Tie the task off as `CLAUDE.md` says.

### Secrets, throughout

The database password, the service role key, the connection string and any access token are never printed, echoed, logged, pasted into a chat or written to a file that outlives the step. They pass between commands in a shell variable or a pipe, with no `set -x`, and a report gives a name and a yes or no, never a value. The project's address, its ref and the anon key are not secret.
