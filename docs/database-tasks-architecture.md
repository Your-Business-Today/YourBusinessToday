# Database Tasks and Auto-Merge — Architecture

Until now a piece of work went from raised to deployed with two hand steps, both James's: merging
the pull request, and running any migration it carried. The first was ceremony — GitHub builds and
tests every pull request already — and the second was the one that bit when it was forgotten: a
migration not run is one cause of site errors. So the pull request now merges by itself once its
checks pass, and the migration becomes a **database task**: one row per migration file a merge
brought to a project's default branch, under projects, for the admin alone, with the exact
command to run it, confirmed as run on the site or through the connector.

## The stories

| As | I want | So that |
| --- | --- | --- |
| The admin | pull requests to merge by themselves once GitHub's checks pass | nothing waits on me but the database |
| The admin | every migration a merge carries listed under projects with what to run it with | I run each one in order and none is missed |
| The admin | an Azure SQL project's migration written as the sqlcmd I use (pfp, bb) | I copy, paste and run |
| The admin | a Supabase project's migration as the file on GitHub at the merge commit, and the script line | I copy the file or run the script |
| The admin | to confirm each as run, on the site or through my Claude | the list is the record of what has and has not been run |
| A Claude on a task | to be told the task is whole or split before the work log | nothing the task asked for is left in prose |

## The two hand patterns

**Azure SQL** (the portals): `sqlcmd -S <server> -d <database> --authentication-method ActiveDirectoryDefault -i <file> -b -o <Name>.log`,
where `<Name>` is the migration's name without its timestamp — `20261013100000_ContactNumbers.sql`
logs to `ContactNumbers.log`. The server and database sit on the project; the file is the path the
push named. A portal's server is Entra-only once its admin password is retired (pfp and bb since
10/10/2026), so sqlcmd signs in as the `az login` user, the server's Entra admin, and the project's
user is left blank. A project that still names a SQL login gets `-U <user>` instead, the password
prompted.

**Supabase** (YBT, Your Brain Today): the file on GitHub at the commit that merged it —
`<repository>/blob/<sha>/migrations/0074_database_tasks.sql` — and
`./scripts/run-migration.sh migrations/0074_database_tasks.sql`, which runs it as one transaction
with the connection string in the shell.

Both are written by `databaseTaskInstruction` (`src/lib/data/databaseTaskInstruction.ts`), pure and
under test, from the project's database details and the task's file and commit.

## The flow

```
pull request opened on a task branch ──▶ the Claude enables auto-merge on it
                                                 │
            GitHub runs ci (check); the main ruleset requires it; GitHub merges
                                                 │
   push to <default branch> ──▶ /api/github-webhook ──▶ handlePushEvent
                                                 │
   project_deploys gains one row; the kit version is read; then for every file the push's commits
   ADDED under the project's migrations folder, database_tasks gains one row (project + file,
   so a redelivery or a second push of the same file changes nothing); then the refactor round if due
                                                 │
   /projects/database (admin) and list_database_tasks show it, oldest first, with the command
                                                 │
   the admin runs it by hand, then confirms it: the row is stamped run_at and run_by_account_id
```

A merge's push event lists the files each commit added, so no repository read is needed: the
webhook payload is enough. A project with no database kind raises nothing; one whose kind is set
but whose folder is not reads the folder its kind usually has (`migrations` for Supabase,
`api/Data/Migrations` for Azure SQL).

## The entities

**Project** — gains `database_kind` (`none`, `azure_sql`, `supabase`), `database_server`,
`database_name`, `database_user` and `migrations_path`, each at most 255 characters. The site's
edit form and `update_project_details` write them; both refuse an Azure SQL project missing what
sqlcmd needs (its server and database; a blank user means Entra-only) and a folder that leads outside the repository (`projectDatabaseRefusal`).

**DatabaseTask** — `database_tasks`: `project_id`, `file_path` (unique with the project),
`commit_sha`, `branch`, `raised_at`, `run_at`, `run_by_account_id`. Only administrators read or
update it; the webhook writes it as the service role. Nothing is deleted: the register is the
record, and the page shows the twenty most recently run beneath the pending list.

## Commands and queries

| Command | Story it serves |
| --- | --- |
| `raiseDatabaseTasks` (from `handlePushEvent`) | every migration a merge adds becomes a task, once |
| `confirmDatabaseTaskRun` (site `confirmRun`, connector `confirm_database_task_run`) | the admin says it has been run |
| `updateProjectDetails` (site and `update_project_details`) | the project says what database it has |

| Query | Story it serves |
| --- | --- |
| `getDatabaseTaskRegister` | the page and `list_database_tasks`: pending oldest first, then run lately |
| `countPendingDatabaseTasks` | `get_current_context` tells an admin's Claude how many wait |
| `databaseTaskInstruction` (pure) | the command and the file link for one task |

## Auto-merge

The repository allows auto-merge (a GitHub setting), and the `main` ruleset requires the ci `check`
status, so a pull request with auto-merge enabled merges when the build passes and not before. The
working doctrine (`workingDoctrine.ts`) now ends the branching rule with auto-merge enabled on the
pull request the Claude opens — `gh pr merge --auto --merge <pull request>`, or the GitHub
connector's auto-merge action — and the branch guard (`tools/branch_guard/refusals.py`) lets that
form through while still refusing a merge by hand. The same two changes belong in the
project-process kit, so the next bootstrap does not undo them; that is a task on the Project
Process project.

The doctrine also says a task is whole or split: before the work log, anything the task asked for
that the branch does not carry is raised as a subtask of its own, so a task is never partly done in
prose.

## Status

Written on 9 October 2026. Migration `0074` must be applied before the deploy that reads it — and it
is the first row this register would have shown. Each project with a database needs its kind set once
(Edit on the project, or `update_project_details`): the two Azure SQL portals need their server,
database and user as well.
