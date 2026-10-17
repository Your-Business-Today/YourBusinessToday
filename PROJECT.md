# This project

This repository's own instructions: its conventions, the commands that build and test it, the domain it serves, and any standing tasks or prompts that belong to this project and no other. `CLAUDE.md` loads this file and every session reads it after the kit's rules.

The project-process kit writes this file once and never touches it again, and `CLAUDE.md` is the kit's, replaced whole every time the bootstrap runs, so anything written there is lost. Write here instead. Where this file and the kit disagree about this project, this file wins, except that nothing here lifts the branch rule: the work still happens on a branch and ends as a pull request.

## Migrations run when their pull request merges

The `run migrations` workflow (`.github/workflows/run-migrations.yml`, calling `scripts/run-added-migrations.sh`) runs on every push to main. It runs each `migrations/*.sql` file the push **added**, in filename order, against the live Supabase database, each in a single transaction with `ON_ERROR_STOP`, as `scripts/run-migration.sh` does by hand.

- **Only added files run, so a file never runs twice.** Every migration before the workflow existed was run by hand; an edit to a file already on main is never run, so a correction is a new migration file.
- **A failed migration stops the run and fails the workflow**: that file is rolled back and the ones after it are not run. Fix forward with a new pull request.
- **The connection is the repository secret `SUPABASE_DB_URL`** (the Session pooler string). When a push adds a migration and the secret is not set, the workflow fails and says so, so nobody takes it for run. A push with no migration passes whether or not the secret is set.
- **No one is at the keyboard when a migration runs, so it protects the data already there.** Additive (`create table if not exists`, `add column if not exists`), safe to run twice, never dropping or rewriting a table, column or row that holds data in use. The database backups are the safety net, not the plan.
- **A green run is the record that a migration ran.** There is no list to confirm it on; a red run is the one thing to act on.

## The site stands before its migration runs

A pull request merges by itself when CI passes; Vercel deploys main and the run migrations workflow runs its migration at the same time, so the two race and the new code may run against the old schema for a while — or for good, if the migration fails. So a pull request whose migration adds a table, a column or a relationship ships code that stands without it:

- **Every reader of the new schema on a path every request runs** — a layout load, a hook, the connector's account standing — answers empty when the schema is not there yet: `if (isSchemaNotYetMigrated(error)) return <empty>;` before the `throw`, from `$lib/server/schema/schemaNotYetMigrated`. Readers behind a page of their own may fail until the migration runs; the connector already tells the caller a migration is missing.
- **Writes are not guarded.** A write to a table that does not exist yet fails and says so; it is never quietly dropped.
- **A migration that drops or renames something live code reads ships in two pull requests:** the first stops reading it, the second changes the schema once the first is deployed.

## Production deploys only from main

Vercel project `ybt` is connected to Your-Business-Today/YourBusinessToday with `main` as its production branch, so every merged pull request deploys production by itself. What is live is always what was merged, with its checks passed.

- **Production is never deployed by hand.** No `vercel --prod`, `vercel deploy --prod` or `vercel promote` of a local build: the CLI ships whatever the local checkout holds and goes around GitHub, its checks and the deploy count.
- **A fix ships by a merged pull request**, however small, and an urgent one is still a pull request that merges at green.
- **A rollback is Vercel's own.** Open the project's Deployments, pick an earlier `main` production deployment and use Instant Rollback, Promote or Redeploy on it; then fix forward with a pull request.
- **A pull request waits on its Vercel preview.** The preview is a required status check on `main`, so auto-merge does not fire while it builds or when it fails.
