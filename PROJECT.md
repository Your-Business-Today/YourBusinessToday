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

## A project's staging branch deploys at its window

Where a project's repository has a `staging` branch, every pull request merges into it and deploys nothing. The project's *Deploy staging to main at* time (UK time, blank for no window; `update_project_details` takes it as `deployStagingAt`) is its deploy window: at that time each day the `deploy_windows` watch source compares `staging` with the default branch and, when staging is ahead, opens one pull request `DEPLOY: staging to <default>, <date>` with auto-merge on (reusing one already open). That merge is the day's deploy; the existing webhook counts it and marks the tasks done. Nothing to promote is recorded as such and skipped; a window that GitHub refused is tried again at the next knock and shows on the project header.

- **The cron door is knocked by `.github/workflows/deploy-windows.yml`**, every quarter hour, because Vercel's Hobby plan runs a cron once a day at most. It needs the repository secret `CRON_SECRET`, the same value as the Vercel variable; the knock never fails the workflow, so a door that answers 401 or 503 is a warning in its log, not a FIX task.
- **The site's `GITHUB_TOKEN` opens the pull requests**, so it needs pull request write on every project repository with a window. No per-repository secret.
- **Each day's window is one row of `project_deploy_windows`**, which is why a window runs once a day however often the door is knocked.
- **Deploy now promotes by hand, outside the window.** The button on the project header (and the connector's `deploy_staging_now`) runs the same promotion at once and keeps the run on `project_deploy_windows` as started by hand, a row of its own. It never takes the place of the day's timed window, which still runs at its time when `staging` has moved on again; the header shows the latest promotion of either kind.
- **Each promotion says what it carries.** The merge commits `staging` holds ahead of the default branch name the pull requests merged into it; each is matched to the task that recorded it (by pull request address, or by branch) and the promotion pull request body lists those tasks with links, and the pull requests no task recorded. The same lines are kept on the window record (`summary`), shown as the header fact's tooltip and by the connector's `read_project`.
- **A task knows where its merged work stands.** The merge of its pull request into `staging` sets `tasks.staged_at`; the merge of the promotion pull request (`staging` into the default branch) sets `tasks.live_at` on every staged task and tells each one it is live. The project page's *Staged, not live* panel lists the tasks between the two, latest merge first, so it is the list of what the next deploy carries; the task's branch panel, `read_task` and `read_project` say the same.
- **Each deploy says what it carried, after the fact.** A promotion's merge marks every task it carries live at one moment, so the tasks sharing a `live_at` are one deploy. The project page's *Live in each deploy* panel lists the last ten deploys, newest first, with the tasks each carried; *Deployment history* (`/projects/<id>/deploys`, from the Actions menu or the panel) holds every deploy, twenty to a page, searchable by task title and filtered by UK date. The connector's `read_deploy_history` answers the same, with the same words and dates, so anyone's Claude can say what went live last night or when something went live. Nothing new is stored: the history is read from `tasks.live_at`.
- **A pull request recorded after it merged is still recorded.** The webhook only hears a merge as it happens, so when `set_task_branch` is given a pull request address, the pull request is read from GitHub (`readMergedPullRequest`): one that has already merged is recorded as the webhook would have recorded it — done and staged, with GitHub's merged step on the lifecycle — and live as well when the default branch already holds its merge commit. An open pull request is left for the webhook; a task already staged or done is not recorded twice; and a GitHub refusal is reported in the action's answer, never a failure of it.

## Production deploys only from main

Vercel project `ybt` is connected to Your-Business-Today/YourBusinessToday with `main` as its production branch, so every merged pull request deploys production by itself. What is live is always what was merged, with its checks passed.

- **Production is never deployed by hand.** No `vercel --prod`, `vercel deploy --prod` or `vercel promote` of a local build: the CLI ships whatever the local checkout holds and goes around GitHub, its checks and the deploy count.
- **A fix ships by a merged pull request**, however small, and an urgent one is still a pull request that merges at green.
- **A rollback is Vercel's own.** Open the project's Deployments, pick an earlier `main` production deployment and use Instant Rollback, Promote or Redeploy on it; then fix forward with a pull request.
- **A pull request waits on its Vercel preview.** The preview is a required status check on `main`, so auto-merge does not fire while it builds or when it fails.
