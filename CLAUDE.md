<!-- project-process:begin -->
<!-- project-process kit v1.58.0 — replaced whole by bootstrap.sh; edit the kit, and write this repository's own instructions in PROJECT.md -->

# How We Work

This file is installed by the project-process kit and replaced whole every time its bootstrap runs; edit the kit, not this copy. Anything written here is lost on the next run.

**This repository's own instructions are in `PROJECT.md`** — its conventions, commands, domain notes and any standing tasks or prompts that belong to this project alone. Read it before starting work, after these rules: @PROJECT.md. The kit creates it once and never rewrites it, so the kit and the project change independently and neither can break the other. A project-specific instruction always goes there, never here. Where `PROJECT.md` and the kit disagree about this project, `PROJECT.md` wins, except that nothing in it lifts the branch rule below.

## The work is logged in Your Business Today

Every piece of work on this repository is done on a task in Your Business Today (YBT), reached through the YBT connector. YBT's `get_current_context` carries the working doctrine and is read first in every session; `describe_action` carries the doctrine of each action. In short:

1. **Start by reading what is new.** Call `read_latest_messages`. Anything addressed to the person you are working with, bring to them; post their answer on the same goal or task.
2. **Find the task before touching anything.** Call `find_tasks` on the project for the matter at hand and work on the task you find. Raise one only when nothing matches, the way YBT's raising doctrine says. A bug is one task, `FIX: <what is wrong>`: bugs are usually small, and anything its fix turns up goes on as a subtask of that FIX while it is being done, never as a new top-level task. A feature is not raised until its user story is known — *as X user, I want Y feature, for Z benefit* — and then as one parent task carrying the story, with the chunks it will be built in raised as its subtasks in the same call (`create_task` with `subtasks`), each sharing the story, named only as far as the work already shows; a piece found while building is another subtask. At every raising find the goal the work serves (`find_goals`): a goal is general, read from what the person is trying to achieve overall — statements sent to customers automatically at month end is credit control automation — so put the task under the goal it serves, rename a goal that has outgrown its title (`update_goal`) and raise a new one only when none is the aim. Where it lands is the design's question: a request that extends the system in the shape its design patterns already have goes on Features; one that falls outside them or changes them, or needs an infrastructure change or upgrade, costs money, or adds a new dependency, ours or a third party's, is pushed back on first and, if the person still wants it, raised with `designChange` so it waits on Requested, and nothing builds it or its subtasks until YBT approves it. Every task sits in its department (rule 5): a development task is a change to the repository that ends in a pull request; an administration, sales or marketing task is a job its assignee does. A task is one session's work — what one Claude session finishes and ties off; one that is more than that is split before it starts into subtasks of it, one per step, each assigned to whoever does it, never into new top-level tasks, and this session works the first. Mark it in progress when the work starts — and start it on a branch named for it (next section), never on the default branch. Before the first change, `read_task` and open every attachment it lists with `read_task_attachment`: a screenshot, a spec, an export or a client's email on the task is part of the ask, not background.
3. **Tie the task off when the work stops, so the chat can be archived.** First raise anything the task asked for that this session has not finished as a task of its own — a subtask of the task, assigned to whoever does it next — and post every question still open as a message waiting on whoever answers it (rule 5), so the task is whole or split, never partly done in prose and never left for a next chat to pick up. Then one message on the task's conversation: what changed, which files or records, decisions taken and why, which tasks carry what is left, and the branch and pull request the work is on. Then mark it done, unless its pull request will do so by itself when it merges: a task stays open only for its pull request to merge or for an answer marked as waiting on someone, never for a chat to come back to it. A chat or a project thread never waits on a person either: when what is left needs someone's answer, approval or action, that is an ask on the task waiting on them, or a task in its business department assigned to them when it is a job they do (rule 5), and the thread is tied off and closed in the same turn, never left open saying it waits for them, and never asking anyone to merge a pull request that merges itself at green. Their answer reaches whoever next works the task, not this thread. Last, tell the person the chat can be archived, naming the tasks that carry the rest and who has them.
4. **Files that the work depends on go on the task, not in the chat.** When a task is raised or updated with information someone will need to do it — a screenshot of the fault, the document the story comes from, a data export, a design — attach it with `attach_file_to_task` once the task exists (creating or updating a task never carries files itself). Give `sourceUrl` for anything already at a public address, up to 25 MB; give `contentBase64` only for a small local file, under 3 MB — larger local files need a public link, or the person attaches them in YBT. Name the file for what it is (`invoice-rounding-screenshot.png`, not `image1.png`) and say in the task's details or message what it shows. Never attach secrets, credentials or personal data the task does not need. Do not guess at what a file said: if the work needs a file that is not on the task, ask for it.
5. **Every task sits in its department; what a person has to give is a message waiting on them.** Every task and goal has a department — development, administration, sales or marketing — and the project page shows one tab for each. A development task is a change to the repository, a bug or a user story, that Claude builds and that ends in a pull request; building is never asked of a person. An administration, sales or marketing task is a job a person does for the business — put the insurance in place, register an account, send a contract — raised in its department and assigned to them (`set_task_assignees`), never titled with their name (*Jeremy: …*) and never in the build queue; they mark it done. **We build software; we do not do the business's day-to-day data.** Entering or keeping up records in the software — a door code, a contacts import, a register — and any small company job that no development task waits on — a funding application, a call to book — is never a task on a project, a thread or an ask: it is a to-do on the own YBT to-do list of whoever does it (`add_todo` with `owner`; an office job is usually the office manager's). A department task is kept for a job the project itself depends on: one a development task waits on, or one the project cannot go live without. Tasks wait for each other across departments with `set_task_waits_for`: the site page that publishes the insurance waits for the administration task that buys it. What a person has to give for a task — information only they hold or a setup (a credential, a key, a DNS record, a payment) — is an ask: a message on the task with `post_message`, `waitingOn` naming them, `waitingFor` saying whether their Claude can answer it alone or it needs them, and `askKind` saying `information` or `setup`. Their Claude brings it to them through `read_latest_messages` or `whats_outstanding_for_me` and posts the answer back, and their *Waiting on you* reads that mark and nothing else — a question written into the task's details or a line in a work log is nobody's and is never chased. A development task whose build needs the answer is considered *waiting on a person* and is not buildable until it comes; one that does not need it is built, merged and done while the ask waits. Nobody tests: there are no testing tasks and no testing asks. A task is done when its pull request merges; it works or it does not, so no session raises a task or posts an ask to try it, test it or check it on a real device, and none holds a task open for one. A fault anyone finds is told to Your Business Today through the connector and becomes a new `FIX:` task. What they promise goes on the message as `promise`, landing on their personal to-do list (which is otherwise for jobs that belong to no project), and work they report done as `progress`. Never relay through chat apps: an ask that is only on WhatsApp, in an email or in a call is one their Claude cannot see.
6. **Consider, claim and record before touching work.** Several AIs work one board — Claude sessions in the cloud, the YBT desktop app's local model, the review model — so each records every step it takes on the goal or task's lifecycle with `record_lifecycle_step`, and none duplicates another's work. Record *considering* before reading code or changing anything: it claims the goal or task for you, a claim on a goal covers its tasks, and a refusal means another AI holds it, so leave it. Name yourself alone as the agent — the session or the machine — because agents sharing a name share a claim. Record each step after it: *considered* with its outcome (buildable, waiting on a person, needs splitting, needs an infrastructure change), *building*, *built*, *reviewing*, *pull request open*; *released* gives the work up, and a claim runs out by itself two hours after its holder's last step. Considering a goal ends with a step on every open task under it, even one that only says what it still waits for; YBT refuses the goal's *considered* until there is one.
7. **Size, decide, then build by the queue.** A coding task is sized with the `task-sizing` skill (its four counts set its story points, and the points choose the model that builds it), and whether it goes autocomplete is the `autocomplete-decision` skill's call. Running on a schedule, take work only through `next_buildable_task` for your own model: it hands out the highest buildable, autocomplete task sized for that model that nobody else holds, and claims it — never pick from the queue yourself. The local model hands its pushed branch to review with `submit_local_build` and never opens a pull request; the review model takes the review task it raises and follows the `review-local-build` skill. One task is still one session's work and one pull request.
8. **Work moves without waiting, on the person's own Claude, and the setup travels.** These are the owner's standing rules for every Claude on every licence:
   - **Start what a Claude can do.** Never ask whether what is done is enough for now: when more can be started, start it and say so. Clear a to-do that is plainly invalid or obsolete — a meeting that has passed, a call nobody can explain — without asking, and say what was cleared.
   - **The generating is done by the asker's own Claude.** A feature that makes something — a video, pictures, a document, an analysis — hands the person's Claude the inputs and signed links over MCP and takes the result back with a record action. Never run that work on GitHub Actions, a queue on our own servers or a paid API when their Claude can do it: the compute is theirs, not ours.
   - **No testing tasks and no testing asks.** When a task is done it works or it does not: it is done when its work merges, and a fault found later is reported to Your Business Today through the connector, where it becomes a new `FIX:` task (rule 5). (James, 16/11/2026: "we dont want testing tasks, if something is done it'll either work or not and bugs will be told to the mcp and form new tasks".)
   - **A status summary leaves out done work.** Say what is open and what needs the person; what is finished is clutter.
   - **Setup lives in Your Business Today or in the repository, never in one Claude account.** The person works from several Claude licences, so a cloud environment's setup script or allowed hosts, an account's skills, connectors, project instructions or memory reach only one of them. Put it in the repository (this kit, `PROJECT.md`, committed scripts, git hooks) or in YBT, and say it works on every licence; where only an account setting can do it, say it must be repeated on each licence. A repository's Claude Code hooks do not run in a project thread, so a rule that must hold everywhere is written here as well.
   - **Use the owner's words.** The ground a staff member prospects is a *territory*, never a *patch*.
9. **Finished work is never deleted.** A task marked done is the record of what was built, and `delete_task` refuses it; one marked done by mistake is moved back first with `update_task_status`. Delete only a task raised by mistake or no longer wanted, on the person's word, and read it first: `read_task` lists its subtasks and where each stands. A task with subtasks is deleted in two calls. The first, with the task id alone, deletes nothing and lists what is under it, finished and open: show the person that list. Its finished subtasks are always kept, moved under a new completed task you name for the work they finished; its open subtasks go only when you say so, after the person has seen them, and one worth keeping is moved out first with `set_task_parent`. YBT keeps a copy of every deleted task with its conversation and history, though not its attached files, and nothing puts one back, so deleting is never a way of tidying a board. A project that holds finished tasks is never deleted either: `delete_project` refuses it, and the project is set to complete instead. `delete_project` is for a project created by mistake, and nothing else: with the project id alone it deletes nothing and says what the project holds, and it goes ahead only when the project's name is given back, once the person has seen that. (James, 14/11/2026: two stories were deleted and seventeen subtasks went with them, finished and live work among them, and losing things done is unacceptable.)

## The work happens on a branch, never on the default branch

Nothing is committed to the default branch (`main`, or whatever `origin/HEAD` points at) by a Claude — not a fix, not a feature, not a refactor round, not a one-line change. The default branch only ever moves by a merged pull request. Where the repository has a `staging` branch, the same holds for `staging`, and it is the **base branch**: every pull request goes into it, and the default branch moves only by the promotion (next section). Where there is no `staging`, the base branch is the default branch. Whether it has one is the remote's to say: `git ls-remote --heads origin staging` prints a line where it has. `git branch -r` proves nothing, because a clone made to fetch one branch, as a cloud session's is, lists no `origin/staging` beside a repository that has it. Every session that is about to change a file does this, in order:

1. **Start from a fresh base branch.** Fetch it by name, `git fetch origin +refs/heads/<base>:refs/remotes/origin/<base>`: a plain `git fetch origin` brings only the branches the clone was made to fetch. If the working tree already holds uncommitted changes, stop and ask the person what they belong to before going further.
2. **Branch from it before the first change.** `git switch -c fix/<slug> --no-track origin/<base>` for a `FIX:` task, `git switch -c feature/<slug> --no-track origin/<base>` for a story; `--no-track` keeps the base from becoming the branch the new one pulls from. The slug is the task's title in lower-case words joined by hyphens, with noise words dropped: `FIX: invoice total is rounded up` becomes `fix/invoice-total-rounding`; the story *A quantity surveyor sees the weekly cashflow grid* becomes `feature/weekly-cashflow-grid`. If a branch for that task already exists, in the clone (`git branch --list 'fix/*' 'feature/*'`) or on the remote (`git ls-remote --heads origin 'fix/*' 'feature/*'`), continue there rather than starting another: one that is only on the remote is fetched by name and switched to in the same way.
3. **Commit on the branch as the work goes**, one commit per verified step, the message a sentence about the domain (`Round the invoice total once, at the line total`), never a list of files. Run the repository's checks before each commit.
4. **Push the branch and open the pull request when the work stops** — done or not. `python3 tools/push_check` first, since git refuses a push of anything the repository's checks have not passed on (below); then `git push -u origin <branch>`, then a pull request into the base branch whose title is the task's title (`FIX: invoice total is rounded up`) and whose body is the work log in short: what changed, why, what is left. With the GitHub CLI: `gh pr create --base <base> --title "<task title>" --body "<the log>"`; without it, push and give the person the compare link GitHub prints. A pull request that already exists for the branch is updated by the push — do not open a second one. When the work is done, turn on auto-merge as the pull request opens (`gh pr merge --auto --merge`, or the GitHub connector's auto-merge) so it merges itself the moment its checks pass.
5. **Claude merges its own pull request once it is green.** The person does not review pull requests by default. When CI is green on the pull request's latest commit and it has no merge conflict, merge it (`gh pr merge --merge`, or the GitHub connector's merge) if auto-merge has not already; where the repository does not allow auto-merge, merging by hand at green is the rule, and the person is told once that ticking *Allow auto-merge* in the repository's settings would save the step. Red CI is fixed on the branch, never merged past. Once the pull request has merged, run `python3 tools/push_check merged`: it says whether the base branch now holds exactly the files the checks passed on in this clone. Where it says the base holds files the checks have not been run on, something was merged alongside this work that the checks never saw with it: check what the base holds now (`git switch --detach origin/<base>`, then `python3 tools/push_check`), and a failure there is a `FIX:` task of its own, raised and fixed before the deploy window, never left for the promotion to find. Merge only pull requests this session opened, unless the person asks for another; never use `--admin` or any other override of the repository's protections; and when the repository requires a person's approval or a label (the migration gate's), say once that the pull request waits on them for that and nothing else. Never push to, rebase onto or force-push the default branch or `staging`, and never `git switch` to either to commit there. When the task's work needs something already on another open branch, say so on the task rather than merging branches yourself.

The repository carries a guard as well as this rule: `tools/branch_guard/`, installed as a Claude Code `PreToolUse` hook in `.claude/settings.json`, refuses any `git commit`, `git merge` or `git push` that would land on the default branch or on `staging`, and any `gh pr merge --admin`, and says why. The same file allows Claude to merge its own pull request at green (`gh pr merge`, `gh pr merge --auto`, the REST merge call and the GitHub connector's merge and auto-merge), so step 5 is not refused as a merge without review. When it refuses, do what it says — branch — rather than looking for a way round it.

A refactor round follows the same shape on a `refactor/round-N` branch, and a code quality check on a `quality/check-<date>` branch (their skills say so); they are the two branches that are neither a fix nor a feature. A process that only reads — the widget identification, the input validation check, the audit and the gate, the deploy count — writes nothing but its own output, so it needs no branch at all and commits nothing (next section).

**Nothing is pushed until the repository's own checks have passed on it.** Where the repository has `tools/push_check/` (the bootstrap installs it everywhere), run `python3 tools/push_check` from the repository's root before every push. It runs `scripts/check-before-push.sh` on the working folder as it stands, remembers exactly which files passed, and arms git in this clone, so that `git push` is refused for a commit that is not, file for file, what passed, and says which files differ. It runs the checks only on work that holds what the base branch holds now, `staging` where the repository has it and the default branch where it has not: where the base has moved on it runs nothing and says so, and the work takes the base in (`git merge origin/<base>`) and is checked again. Where the base is `staging` it also says, on every run, that the work's pull request goes into `staging`: straight after a promotion the two branches hold the same files, so work cut from the default branch passes, and nothing else would say where it belongs. Two pull requests that each pass alone can fail together, and GitHub's check tests a pull request against its base only as the base stood at the push, so checks that passed on work lacking what has been merged since say nothing of the two together. The one urgent fix that goes into the default branch names its base: `python3 tools/push_check --base <default branch>`. The checks file is the repository's own statement of what its required check on GitHub runs: the bootstrap writes it once, to run the audit's tests, and where that check is a workflow of the repository's own, the file is made to run what the workflow runs. A check that fails is put right and run again here, never pushed for GitHub to find, because a red run there is an email to the person the session pushes as. When a check cannot be run on this machine at all, for want of a toolchain that cannot be had here, the checks file stops with exit 69: the push is let through with a warning, and the pull request says what was not checked and why. Never go round the check to save time: not with `git push --no-verify`, not by putting files on a branch through the GitHub connector, not by writing the record yourself. The one push that goes round it is work that has to stop while a check still fails, since work left on one machine is lost: push that with `--no-verify`, and say in the pull request's first line which check fails and why. Git keeps its hooks outside what is committed, so each clone is armed where it stands, by a `SessionStart` hook in `.claude/settings.json` as a Claude Code session starts and by the tool whenever it is run; a clone that keeps git hooks of its own is left as it is and told the one line its `pre-push` needs. A repository's Claude Code hooks do not run in a project thread, so there git is armed only once the tool has been run: run it before the first push in every clone.

**A repository that builds with .NET fetches its own SDK, so nothing is pushed unbuilt.** Where the repository has `tools/dotnet_sdk/` (the bootstrap installs it in every .NET repository), every `dotnet` command is run through it, from the repository's root: `python3 tools/dotnet_sdk dotnet build`, `python3 tools/dotnet_sdk dotnet test`, or a script that calls `dotnet`. It runs the command with the SDK the repository's `global.json` names. On Linux that is Microsoft's own, fetched once into the user's cache from packages.microsoft.com in about fifteen seconds, with a NuGet package folder of its own; it needs no setting on any Claude account or cloud environment, so it works on every licence. Elsewhere it is the installed `dotnet`, when that satisfies `global.json`. So a session has no reason to push .NET work it has not built and tested. Never install the operating system's SDK instead (`apt install dotnet-sdk-…`): Ubuntu's is built from source with packs of its own, and a lock file written after it has restored carries hashes that GitHub's locked restore refuses. When the tool says the SDK cannot be had, it has not run the command: say in the pull request what was not built or tested and why, rather than pushing as though it had been.

## Where there is a staging branch, the default branch moves only by the promotion

A repository that deploys from its default branch, and has a `staging` branch, ships at a deploy window rather than on every merge: merging a pull request into `staging` deploys nothing, and the default branch moves only when `staging` is promoted into it. The promotion is one pull request, `DEPLOY: staging to <default>, <date>`, from `staging` into the default branch, merged by itself at green; that merge is the one deploy, and it runs the migrations the window's work added. Your Business Today opens it itself, at the project's deploy time set on the project, and turns its auto-merge on. The `promote-staging` workflow (`.github/workflows/promote-staging.yml` and `scripts/promote-staging.sh`, installed by the bootstrap where `staging` exists) does two other things: its `promote` job is the by-hand route, opening the same pull request when someone presses *Run workflow* in the Actions tab, and its `level` job runs by itself after every merge into the default branch and brings `staging` level. So when a night's promotion goes wrong, look first at Your Business Today's deploy record for the project; when the levelling goes wrong, look at the workflow's run. Nobody promotes by any other route, and nobody merges the promotion pull request past red CI: a red promotion is fixed on a branch into `staging`, and the next window carries the fix.

- **A task is done when its pull request merges into `staging`**; Your Business Today marks it so, and counts a deploy when the promotion reaches the default branch. Say *merged into staging, deploys at the window*, never *live*, until the promotion has merged; to someone who will use the change, say *This deploys tonight. Start a new Claude chat tomorrow to use it. If you need it sooner, shout.* (Jeremy, 30/10/2026: people told *done* tried it the same day and it failed).
- **An urgent fix is the one pull request that goes into the default branch**, and only when the person asks for it by name as urgent: `fix/<slug>` from a fresh default branch, pull request into the default branch, merged at green. After any merge into the default branch, the promotion workflow brings `staging` level with it: nothing when the two hold the same files, a fast-forward where `staging`'s ruleset allows a push, else a pull request `LEVEL: <default> into staging, <date>` that merges itself at green — so the fix reaches `staging` without anyone opening that pull request by hand, and a merge into `staging` deploys nothing.
- **A pull request opened into the wrong base is retargeted, not merged**: `gh pr edit <number> --base staging`.
- **Where `staging` and the default branch conflict, nothing deploys until it is put right.** Neither the promotion nor the levelling pull request can merge, and whatever opened it says so rather than leaving it open: the workflow stops red, naming the pull request and the files that clash, and Your Business Today raises a `FIX:` task on the project. Put it right the day it is found: merge the default branch into a `fix/<slug>` branch cut from fresh `staging`, settle the clashes there, regenerate any generated files, keep `staging`'s copies of the audit's reading files, and send the branch into `staging` as a pull request merged with a merge commit, never a squash, which leaves the default branch's commits out of `staging` and the two still in conflict.
- **Nothing in the chat waits for the window.** The work log names the pull request and the branch; the deploy time is the project's setting, not the task's.

The workflow opens its pull requests, the by-hand promotion and the levelling, with the repository secret `PROMOTION_TOKEN` — a person's or an app's token, because a pull request opened with the Actions token runs no checks and its merge deploys nothing — and needs the ruleset to require *Run test suite* on `staging` as on the default branch, so the kit's `setup-github.sh --with-staging` creates the branch, stores the token and reports the check. A repository with no `staging` branch is untouched by all of this: its base branch is its default branch, as before.

## Migrations run themselves when their pull request merges

Nobody runs a migration by hand. When a pull request merges, GitHub runs every migration file the merge added to the default branch, in filename order, each in one transaction, against the live database: the `run migrations` workflow with `scripts/run-added-migrations.sh` for a Supabase database (the bootstrap installs both with `--with-migration-run` or `--type saas`, the files are in `supabase/migrations/`, or `migrations/` where a repository already keeps them there, and the connection is the repository secret `SUPABASE_DB_URL`), and the portal template's own workflow for an Azure SQL portal. Because no one is at the keyboard when it runs:

- **A migration protects the data already there.** Additive (`create table if not exists`, `add column if not exists`), safe to run twice, never dropping or rewriting a table, column or row that holds data in use. A correction is a new migration file, never an edit to one already merged, which never runs again. The backups are the safety net, not the plan.
- **The code stands before its migration runs.** The deploy and the migration start together on the merge, so a reader of a new table or column on a path every request runs answers empty until it exists, and a migration that drops or renames something live code reads ships in two pull requests: the first stops reading it, the second changes the schema.
- **A green run is the record; a red run is the thing to act on.** A failed migration is rolled back and stops the ones after it; fix it forward with a new pull request and tell the person, since that is the one migration they need to hear about.

So a migration is not news for the chat: do not list it, ask the person to apply it, or remind them of it when a pull request opens or merges. It is named in the pull request body and on the task's work log, as any change is. Where a repository has a database and no workflow runs its migrations yet, say so on the task once and point to `--with-migration-run`, rather than running the migration yourself.

## A repository built on a template carries a template change to its siblings

Some repositories are built on a shared template — a company portal is the portal template (jamesbeadle/portal-template) plus its company's domain — and when one is, its `PROJECT.md` says so: which template, which folders are the template's, and which other repositories are built on it (the register is `portals/portals.json` in the portal-template repository). In such a repository, decide before the first change whether the change is the template's or this repository's own. It is the template's when it is made in a file the template holds and is not about this company's domain: a bug in the shell (sign-in, the directory, to-dos, the mailbox intake, the connector framework), a change to a catalogue widget, the shared styles or the brand the portals share, a fix to how the layout works on a phone. A template change is made in every repository on the register, not only this one:

1. **Say so on the task** before the first commit, naming every repository it will go to.
2. **Branch in each under the same name** — the same `fix/<slug>` or `feature/<slug>` — from each one's fresh base branch, and make the change in each repository's own words (its namespaces, its *project* or *job*). Each is its own pull request, titled with the task, whose body names the others. A sibling that is not checked out in this session is cloned, or the task says plainly which repositories still need the change.
3. **Read the drift when it is done.** The portal-template repository's `portals` server (`compare_template_file`, `read_template_drift`) shows whether the copies now agree; a file that still differs is a change not carried or a place a repository is rightly its own, and the pull request says which.

A change that is this repository's own stays here. When it is not clear which it is, ask the person, naming both.

## A new project is set up by its type, the way the others were

A new project is one of two types, and the type is decided before anything is built, because it decides the stack, the hosting and every setup step after it:

- **A business portal**, a company's own back office, is the portal template: Blazor and .NET on Azure with Azure SQL (`bootstrap.sh --type portal`). The template's own instructions carry its setup.
- **A high volume SaaS**, a product anyone can sign up to, is SvelteKit, Tailwind and TypeScript on Vercel, with one Supabase project (`bootstrap.sh --type saas`). `Your-Business-Today/carp-mania` is the reference project.

The person says which; where they have not, ask once, naming both. Then the `project-setup` skill is the setup, step by step, and a session follows it rather than writing one. Four things hold whatever else is unclear, each learned the hard way (James, 22/11/2026: "why are you not following the project process... you can see all the other projects, none have 2"):

- **The project process is this kit.** Asked to add it, run its bootstrap. Never write a process, a `CLAUDE.md` or a workflow of your own in its place, and where the kit is silent, copy the reference project.
- **One Supabase project for one app.** Never a second for staging or previews, and never offered as a choice.
- **Claude does the setup, not the person.** It needs a route to the services, so ask for one before anything else: Claude Desktop beside the `supabase`, `vercel` and `gh` CLIs, signed in, or the Vercel and Supabase connectors connected to Claude. Never hand the person a checklist of dashboard steps instead. The CLIs are the Mac's and work from every licence; a connector is an account's and is connected on each.
- **Say what exists only after reading it.** A run that stopped part way may already have created the thing: list what is there before creating anything, and before saying nothing was created.

## Every process is asked for by name

The kit offers the processes below and no others, and each one is also a tool on the repository's `project-process` server (`.mcp.json`, served by `tools/mcp/server.py`): `run_code_quality_check`, `run_widget_identification`, `run_input_validation_check`, `run_refactor_round`, `run_widget_design`, `run_end_of_day`, `run_tutorial_films`, `run_project_setup`, `read_code_quality_score`, `read_refactor_round_due`. Calling a tool runs that process and no other — there is no nearest match for it to fall into — and a name the kit does not carry is refused with the list of the ones it does. Each is also run by the sentences beside it — say one of them, in these words or close to them, and the session does what the named skill in `.claude/skills/` says: it reads that `SKILL.md` and follows it; it does not improvise the process. The sentences are the names, and a word they share is not a name: three of them say *widget*, so the whole sentence is what is matched, never the word.

- **"Run the code quality check"** / **"score the repo"** → `code-quality-check`. Measures the repository, and on a `quality/check-<date>` branch writes a box at the bottom of `README.md` holding the code quality score (one percentage), with three things expandable beneath it: how the score is made up, the count of every file in the repository split by area, and the refactoring plan. It also writes `tools/refactor/refactor-plan.md` — the steps a refactor of this repository follows, in order — and refreshes `tools/refactor/site-definition.md` on the way. It changes no source code, and it ends as a pull request because it changes the README. One command does the measuring: `python3 -m tools.refactor.audit.quality_check .`
- **"Run the widget identification"** / **"identify the widgets"** / **"where are the widgets written by hand"** / **"show me the site definition"** → `widget-identification`. Reads every view and writes `tools/refactor/site-definition.md` alone: what a user sees at each route, in the widget notation from the views themselves, with every place a view writes by hand the markup a catalogue widget should own, and the table of those places widget by widget. Read-only: no branch, no commit, no pull request, no score box, no plan. It identifies the widgets; it never adopts them.
- **"Run the input validation check"** / **"check the inputs against the schema"** / **"can anything write data that does not fit its column"** / **"is the MCP server validating its inputs"** → `input-validation-check`. An ad hoc reading, run when asked: sets every entry point that writes — API routes, server actions, command handlers, MCP tool and action handlers — against the column types and constraints it writes to, and writes `tools/refactor/input-validation.md`, each column guarded, mismatched, unguarded, form only or repaired, with whether the form mirrors it. Read-only: no branch, no commit, no pull request, no score box. It finds the gaps and fixes none of them. The refactor round closes them: input validation is scored, so it is one of the round's steps.
- **"Refactor the repo"** / **"run a refactor round"** → `refactor-round`. One measured round on a `refactor/round-N` branch that takes the next steps from the top of `tools/refactor/refactor-plan.md`, in order: widget adoption (replacing the hand-rolled markup the identification found with the widget), then component breakout, then utility function identification, then design pattern identification and modification, then the sweep to zero, which includes closing every write door that does not check its input against its columns. Behaviour does not change, with one exception: a door now refuses, by name, a value its column cannot hold. It ends by running the code quality check, so the pull request carries the new score and the plan for the round after. Also due, unasked, when `tools/refactor/deploys_since_baseline.sh` says so, or when `REFACTOR: round N` is open in Your Business Today.
- **"Run end of day"** / **"close the day"** → `end-of-day`. The round if one is due, the check that the connector covers what changed today, the plain-English summary on the day's tasks, and the day's branch pushed and its pull request open.
- **"Set up the widget designs"** / **"Extract the brand from <references>"** / **"Extract the design for <Widget> from <images>"** / **"Check the site against the brand"** / **"Check the widgets against their designs"** → `widget-design`. Optional, for a site big enough to have a widget catalogue. The brand sheet (`docs/design/brand.md`: every colour, type, spacing, radius, elevation and motion token with its role) and a design sheet per widget that has one (`docs/design/widgets/<Widget>.md`, extracted from images or any reference, in token names) are the design; the index is `docs/design/widgets.json`. A question — *are the brand colours used appropriately*, *does RecordsTable match its design* — gets the reading and changes nothing; a **Check** fixes the widget, on a branch, as a pull request. Before building or changing a catalogue widget, or a view that needs a look no widget gives, read the index: a widget with a sheet is built to the sheet, and everything else to the brand sheet. The audit reports when each check last ran; it never runs them, because a design is a judgement.
- **"Set up the project"** / **"set up a new project"** / **"add the project process"** (to a repository with no site in it yet) / **"set up Supabase and Vercel"** → `project-setup`. Decides the project's type first, then carries out that type's setup and no other (next section).
- **"Film the tutorials"** / **"make a tutorial video"** / **"film a tutorial for <feature>"** → `tutorial-films`. Short narrated films of the site on made-up data, put in the project's tutorial library in Your Business Today. The kit's tools in `tools/tutorial_videos/` (installed with `--with-tutorial-films`, refreshed on every run) record, highlight, narrate with a local voice and compose; the repository keeps only its own look (`film-look.json`), screen places (`places.js`) and scripts (`videos/`), committed on the task's branch. The films themselves live only in Your Business Today, and are never made from a client's real data.

Two readings are commands rather than skills, and a person asks for them as questions. **"What is the code quality score?"** / **"run the audit"** / **"does the gate pass?"** is `python3 -m tools.refactor.audit.run_audit . --output tools/refactor/audit-output --fast` then `python3 -m tools.refactor.audit.gate tools/refactor/baseline.json tools/refactor/audit-output/audit.json`: the score is printed and the gate says which ratcheted figures are worse than the baseline — read-only, no branch, and not the code quality check, which publishes. **"Is a refactor round due?"** is `tools/refactor/deploys_since_baseline.sh`: the commits on the default branch since the baseline was last committed, against the rhythm (ten unless the project says otherwise).

A process that changes a tracked file — the check's README box, a round's code, a design check's widget — runs on its own branch and ends as a pull request that merges once its checks pass, never as a commit on the default branch. A process that only reads — the widget identification, the input validation check, the audit and the gate, the deploy count — needs no branch and commits nothing; asking for one of these never produces a pull request.

**When no name matches, say so.** A request that names a process this list does not carry — *the widget pass*, *the site survey*, *the cleanup*, *the process I added* — is not routed to the nearest process that shares a word with it. Say plainly that the kit has no process of that name, name the nearest entries by the sentences above with one line each on what they write and whether they change code, and ask which is meant. Put the choice in the kit's words, never in words of your own: a session once asked *"the widget pass (refactor steps 227–232), or the quality check only?"* when the person wanted the read-only site definition, and the option carrying the word *widget* was a five-commit refactor round — the question inherited the very gap it should have named. Guesses are not the menu; the list above is. When the person's request could be one of two entries here, ask with both sentences quoted; when it is plainly one, run it.

Behind all of them the repository carries `tools/refactor/` — an audit that measures the code against the rules below, a score made from every figure it takes, and a gate that fails when a ratcheted figure is worse than the committed baseline. Nothing runs on GitHub: the measuring is run by the skills. Your Business Today can also raise `REFACTOR: round N` on the project as the reminder when its own deploy count reaches N. Refactor rounds never add a feature or change the schema. Every element the score counts is fixable by a round, and the plan carries steps for each one: a figure that is scored but never fixed would not be a criterion.

The score is the measure of the rules below, so new code is written to score 100%: every rule in *How I Write Code* is one the audit counts. Before saying any piece of work is done, run the fast reading and the gate — `python3 -m tools.refactor.audit.run_audit . --output tools/refactor/audit-output --fast` then `python3 -m tools.refactor.audit.gate tools/refactor/baseline.json tools/refactor/audit-output/audit.json` — and fix what the work introduced. The reading lands in `tools/refactor/audit-output/`, which git ignores, so it never rides along with the work and two sessions' pull requests never clash on it; what is published stays tracked — `baseline.json`, `baseline-report.md`, `refactor-plan.md`, `site-definition.md` and the README's score box.

## The rules travel with the repository

The coding rules that follow are the whole standard. They live here, in the repository, because a machine-level `~/.claude/CLAUDE.md` does not reach cloud sessions or anyone else's machine. Repository-specific conventions belong in `PROJECT.md`; decisions worth keeping belong in `docs/`.

# How I Write Code

Read this first. Everything below is how I think, not just what I want. If you understand the principle, the rules follow naturally. If you only follow the rules without the principle, you'll satisfy the letter and miss the point.

## The Core Idea

**Code is prose.** A file should read like a story about the domain. When someone reads it, they should understand what is happening without running it, without comments, and without holding much in their head. The language of the code — names, structure, flow — is how the domain reveals itself.

This is the lens. Every other rule below is a consequence of it.

**The diagnostic test:** if a line of code doesn't make sense as a sentence, something is wrong. Not with the line — with the structure around it. Bad code reads badly because it reflects a flawed understanding of the problem. When you feel friction reading, stop and restructure. Don't paper over it with a comment.

**Language is also how the code is judged.** We work with language models, and a language model reads code the way it reads anything else: as language. Code that reads as articulate prose is code a model can extend, analyse and refactor correctly; code that doesn't is where it guesses. So legibility is not a courtesy to the next reader — it is the property that makes the codebase workable at all, and it is measured: the repository's code quality score counts every rule below.

### A line reads as a sentence

`if (is(getApple(1).colour == "RED"))` is three ideas tangled into one line: fetching an apple, reading its colour, and knowing what red is. `if (apple.colour == Colours.red)` is a sentence. Get there by naming things before the statement that uses them — `var apple = getApple(1);` on the line above is not waste, it is the subject of the sentence being introduced before the verb. An extra local that makes the next line legible is always worth its line.

- **No calls tangled inside calls in a condition.** A condition states a fact about named things. Do the fetching and computing above it, give the results names, and let the condition read.
- **Never compare against a raw literal.** `== "RED"`, `=== 'paid'`, `> 5` say what the value is, not what it means. Compare against a named value: `Colours.red`, `InvoiceStatus.paid`, `Limits.maximumAttempts`.
- **Never read a member off the result of a call in the same breath.** `getApple(1).colour` hides the apple. Name the apple.
- **If the code is written with the right prose, comments are not needed anywhere.** The need for a comment is the proof that the prose has failed.

## How to Approach a Codebase

Before writing any code, the work has to flow through five stages in order. Each stage is derived from the one above it. Nothing exists in a lower stage that isn't demanded by a higher one.

**1. User stories.** A software project is the sum of its user stories. Every story has the shape *as X user, I want Y feature, for Z benefit*. If a feature can't be expressed this way, it shouldn't exist yet. The full set of stories defines the scope of the project — nothing more, nothing less.

**2. User experience through UI.** Each story is delivered through a view. Imagine the wireframe: what screens, what components, what flows. A table here, a form there, a modal for confirmation, a graph for the summary. The UI is the concrete realisation of the story. Industry-standard, high-quality UX — known patterns, known components, no invention for invention's sake.

**3. Site map.** Stories don't live in isolation and neither do their views. Map every story to a view, then map the views to each other — what links to what, what nests inside what, where the user enters, where they go next. A projects dashboard isn't a single-story view; it's a hub that fans out to every project-level feature. A project detail view serves dozens of stories at once. The site map consolidates the per-story wireframes into one coherent application.

What this reveals:
- **Shared views.** The same view appears in many stories. Design it once with full knowledge of every demand placed on it, not as a side-effect of one story at a time.
- **The navigation hierarchy.** Dashboard → project → task → comment isn't decoration, it's the user's mental model of the domain. If the navigation feels awkward, the domain hierarchy is wrong — fix the hierarchy, not the navigation.
- **Speculative views.** Any view not reached by a user story shouldn't exist. If you find one, either it's missing a story (go back to stage 1) or it's not needed (delete it).
- **Missing entry points.** Any story whose view isn't reachable through navigation has a gap — the user can never trigger it. Surface the gap before building anything.

**4. Data structure.** With a consolidated site map you now know every view and everything each view demands. The UI reveals the domain. A table's columns *are* an entity's properties. A form's fields *are* the inputs that entity accepts. A flag in the UI *is* a property on the model. Rarely does a domain property exist that doesn't surface somewhere in the UI — and when it does, it's derived from properties that do. Build the entity diagram from what the *unified* set of views demands across the whole site map. Single source of truth. Derive what's derivable; store what isn't.

**5. Backend.** By this point the hard decisions are made. Entities are known. Operations on them are known (because the UI demands them). The backend becomes a translation layer between the data structure and the UI, not a design problem. It articulates cleanly through CQRS — see below.

### The backend articulates through CQRS

CQRS is the default skeleton for the backend, chosen for the same reason everything else here is chosen: language. Every command and every query is a named intention that reads as a sentence — `CreateProject`, `ArchiveProject`, `GetProjectsForUser`. A command or query *is* a user story made executable. This maps the backend one-to-one onto the stories from stage 1, which is exactly the articulation the rest of these rules demand.

The flow within the backend:

1. **Every user story becomes a command or a query.** Commands change state; queries read it. If a story doesn't map cleanly to one or the other, the story isn't fully understood — go back up the chain. The full set of commands and queries should account for every story, nothing more.
2. **Implement the entry points with their gates.** Each command/query entry point handles authorisation, authentication, and validation *first* — before any domain logic runs. These are the gates the request passes through, and they read as exactly that.
3. **Identify the design pattern from expected usage.** Only now, knowing what the operations are and how heavily each will be used, does a scalable pattern reveal itself. This is emergent, not imposed — the same rule as everywhere else. Don't pick a pattern from a catalogue; let expected usage show you the shape.
4. **Wire the pattern implementations to the entry points.** The entry points (with their gates) delegate to the implementations the pattern produced.
5. **Derive types and DTOs from the implementations.** The data-transfer objects fall out of what the implementations actually need — they're discovered, not designed upfront. This is the same principle as entities falling out of the UI: the lower artefact is shaped by the demand above it, never speculated.

The discipline is that CQRS is the *framework for articulation*, not a constraint to fight. The design patterns that emerge inside it (step 3) are still discovered, never forced. CQRS gives the backend its language; the patterns give it its structure; the rules below give it its prose.

### Working in reverse

When approaching an *existing* codebase, walk the chain backwards. Infer the user stories from the UI. Find the views and how they connect — that's the site map. Trace them to the entities. Then look at the backend. If any layer doesn't trace cleanly to the one above, that's where the codebase has drifted from its purpose — and that's usually where the bugs and confusion live.

### Ambiguity means you don't understand the domain

If a user story isn't clear, you haven't understood the domain. Don't proceed. Don't fill the gap with a guess. Don't ask "how should I implement this" — go back and ask "what does this user actually need, and why". Every domain *can* be visualised once it's understood. If you can't picture the UI, the domain isn't yet clear. Resolve that before doing anything else.

The same applies further down the chain. If the UI is unclear, the story isn't fully understood. If the site map is unclear, the views aren't fully understood. If the entity is unclear, the site map isn't fully understood. Always go *up* a layer to resolve confusion, never sideways or downwards.

### What this means in practice

- Don't start coding because a request sounds clear. Ask which user story it serves and what the UI looks like.
- Don't invent entities or properties that no UI demands. If you find yourself adding a field "just in case", stop — it's speculation, and speculation is the enemy of clean code.
- Don't design the backend first and bend the UI to fit. The UI defines the shape of the data, not the other way around.
- If asked to add something that doesn't trace back to a user story, flag it. It might be valid (infrastructure, tooling, refactor) but it deserves to be named as such, not smuggled in as a feature.

## Naming

Names are the most important thing in the codebase. Get them right and most other problems disappear.

- **Use the full word.** `pageNumber`, not `page`. `buffer`, not `buf`. `request`, not `req`. No abbreviations, ever, except for genuinely universal ones like `i`/`j` in tight loops or `id`.
- **A name should be exactly what the thing is.** If you can't name it precisely, you don't understand it yet — stop and think before continuing.
- **Booleans are questions.** `isAdmin`, `hasAccess`, `shouldRetry`, `canEdit`. Never `admin` (ambiguous — is it a flag or an ID?), never `access`, never `retry`. The name must make the call site read like English: `if (user.isAdmin)`, not `if (user.admin)`.
- **Infer the type from the name.** A reader should know roughly what they're dealing with from the variable alone. `users` is a collection. `user` is one. `userCount` is a number. `getUserById` returns a user.
- **If a name needs a comment to clarify it, the name is wrong.** Rename instead of commenting.
- **When a name feels awkward, the abstraction is probably wrong.** Awkward names are a signal, not a problem to work around.
- **A function name that glues nouns together wants to be an object.** `getAppleColour()` is a lazy output: it exists because nobody modelled an apple with a colour. `apple.colour` is the same fact expressed by a proper object with properties, and unlike the glued function it extends — the next property is a property, not another function. Accessor functions named for a type and one of its properties (`getInvoiceStatus`, `getProjectOwnerName`) are a modelling failure that compounds over time; model the object. A name that finds a thing (`getUserById`, `getProjectsForUser`) is a lookup, not a glued accessor, and is fine.
- **A long function name is a missing type.** More than five words, or more than forty characters, means the name is carrying context that belongs to a class or module: `calculateInvoiceLineTotalIncludingTax` wants to be `InvoiceLine.totalIncludingTax`.

## No Comments

If the code needs a comment to be understood, the code has failed to articulate the domain. Fix the code instead.

Exceptions, narrow:
- Public API documentation (docstrings on exported functions/types) where tooling consumes them.
- Genuinely non-obvious *why* — e.g. "this works around a bug in library X version Y" or "this ordering matters for legal compliance reasons". The *what* and *how* should always be in the code itself.

Never write comments that restate what the code does. Never leave `// TODO` comments without an owner and a reason.

## Magic Values

Never inline a raw literal that has meaning beyond its value.

- `circumference * 3.142` is wrong. `circumference * MathematicalConstants.Pi` is right.
- Hex colour values inline are wrong. Use a theme/config (e.g. Tailwind tokens, a `colours` module).
- Repeated string literals that represent the same concept get a constant.
- Group constants meaningfully (`MathematicalConstants`, `HttpStatus`, `ErrorCodes`) so the call site reads as a sentence: `if (response.status === HttpStatus.NotFound)`.

The test: can a reader tell what the value *means*, not just what it is? If not, name it.

## File Size

**Hard target: no file longer than 100 lines.** This is a forcing function, not an aesthetic. Long files are a symptom — of missing abstractions, of missing components, of not using the framework properly, of conflating concerns.

When a file grows past 100 lines, the question is never "how do I make this fit" — it's "what have I failed to extract?" Almost always there is a helper, a sub-component, a utility, or a separate concern hiding inside.

Exceptions, real but rare:
- Framework-imposed "god files" (e.g. a routing manifest, a barrel export, a generated types file).
- A coherent set of constants or types where splitting would scatter related things.

If you're about to exceed 100 lines, default to splitting. Justify keeping it long, not splitting it.

The figures that measure this are not independent of each other. You cannot keep reducing the longest file and still have files over 100 lines: the number of files over the limit and the length of the worst of them both go to zero, together, and everything else the audit counts goes with them. Dividing a long file pushes its contents somewhere — more files, more functions, a new near-duplicate — and recognising the patterns and duplications in that overflow, and putting them in order, is the work; it is not done when the file is merely short.

## Components Own Their Functions

A long frontend file is several components that have not been separated yet. Find the chunks of markup that are clearly one thing — a table, a form, a dialog, a panel, a row — and break each out into a component **with the functions that belong to it**. A function used only inside a chunk moves with the chunk, and so does the state only it touches; a component that leaves its functions behind in the parent is half extracted, and the parent stays long.

- Hook the component up through the framework's own mechanism and nothing else: typed parameters in, named events out. It never reaches back into its parent, and it is never handed a grab-bag object to avoid deciding what it needs.
- It must work exactly as before. Breaking out a component is a move, not a rewrite.
- A component that needs a long list of parameters was cut at the wrong seam. Take the larger chunk around it or the smaller ones inside it.

## Content Widgets Draw Only Their Content

A catalogue widget is one of two kinds. A **container widget** — a panel, a modal, a page — draws a box: the border, the rounded corners, the shadow, the scroll box with its maximum height. A **content widget** — a table, a heading, a field — draws only its content, never a box around it. A boxed table is composed, not built: `<Panel><RecordsTable /></Panel>`.

The reason is adoption. A table that draws its own panel cannot be put inside a modal, a panel or a print sheet without being restyled, so the views that need it there write the table by hand instead, and the catalogue stops being adopted exactly where it was meant to make every table the same. The audit measures this: a content widget whose outer element carries container styling is reported and ratcheted, and it is never exempted — an exemption lowers the count without making the code any more consistent.

- A content widget's outer element carries no panel, `border`, `rounded`, `shadow` or `max-h-` class, and is never a container widget.
- Where a widget needs a box in most of its uses, the box is still the view's to compose; the widget does not grow a parameter for it.
- A content widget's design sheet describes no box either. The box in the reference belongs to the container the widget sits in.

## Every Function Has a Home and a Reason

Ask two questions of every function, when writing it and when reading it:

**Is this the right home for it?** If another component or file within the same design pattern could use the function, it is a utility, and it lives in a named, focused module — abstracted as far as that module's purpose requires and no further — where it can be reused. The same function declared in two files is one utility that has not been given its home yet. Same means the same body or the same concept, never just the same name: every form having its own `onSubmit` is each component doing its own job, and folding those together would be abstraction for its own sake. This is not premature abstraction: "just in case" is speculation about a user nobody can name; a utility is justified when the design pattern itself names who else will use it.

**Should it exist at all?** A function's existence has to be justified. Would a reader expect this function in the standard implementation of this kind of view, handler or module? If not, it is usually masking a bad implementation of something the framework should be handling — hand-rolled loading flags, binding, routing, validation, formatting, state synchronisation. Remove it by doing the thing the framework's way, not by tidying the workaround.

**Nothing is left uncalled.** A component or function that nothing calls is deleted, not kept for later. Version control is where old code lives.

## Inputs Are Checked Where They Enter

A value that will be stored is checked against what its store accepts, at every door it can come in by, before it is written. The store's own shape is the contract — a column's type, length, range, precision and scale, nullability, format and allowed values — and the check reads that contract rather than inventing a looser or a different one.

- **The service is the guard.** Every entry point that leads to a write — an API route, a server action, a command handler, a message consumer, an import, an MCP tool or action handler — checks every value itself, at its gate, before any domain logic runs. Anything can call it without passing through a form, so nothing in front of it counts toward its safety. An agent calling an MCP tool never sees the frontend; the handler has to be enough on its own.
- **The form mirrors it for the user.** The same limits sit on the input the user types into — length, range, step, required, pattern, the list of choices — so the problem is shown before submitting. That is usability, never the guard: a form check with no service check behind it is a finding.
- **Reject, never repair.** A value that does not fit is refused with an error naming the field and the limit. It is never truncated, rounded, clamped or coerced quietly, and the store is never the first thing to complain.
- **The limits are stated once.** They are derived from the schema, or declared once beside it, and the service and the form both read that statement. The same `200` typed into a validator, a form and a migration is three limits waiting to drift apart.

## Function Size and Shape

**A long function is a contradiction in terms.** The entire point of a function is to break long content into small, named, understandable pieces — so a massive function is a function refusing to do its own job. There is no real reason for one to exist. **Soft limit: ~30 lines.** As with files, when a function approaches the limit the question is never "how do I make this fit" — it's "what have I failed to extract?" Almost always there's a smaller function, a utility, or a separately named step hiding inside. Extract until each function does one thing and its name says exactly what that thing is — then the parent function becomes a short sequence of named steps that reads like prose, which is the whole goal.

- **Functions should be short.** If a function is long, it's doing too much. The extracted pieces don't need to be reused anywhere else to justify existing — a function whose only purpose is to give a name to one step of its caller has already earned its place.
- **One hop per line (Law of Demeter, informally).** A line may take one step into an object and no further. `apple.colour` is the whole allowance; `apple.colour.hexCode` is already too far, and `order.customer.address.postcode.format()` is a walk through three objects' insides to reach a fourth. The depth is the measure, not the dot count: a fluent pipeline of calls — `invoices.Where(…).Select(…).ToList()`, `items.filter(…).map(…)` — hands back something new at each step and is not a walk into anything, while `invoice.project.client.name` is, wherever it appears, including inside a lambda or in markup.

  **The fix is to model the object, not to name the hop.** A chain is evidence that a type is missing a property or a method, so the first move is to give it one and let the caller ask: `apple.colour.hexCode` becomes `Colours.getHexCode(apple.colour)`, and `invoice.project.client.name` wants to be `invoice.clientName`. The caller holds an apple and asks the thing that knows about colours, rather than reaching through the apple to get at it. Only when the type is genuinely not yours to change — a framework object, a third-party model, generated code — does the chain become a named local instead: `var client = invoice.project.client;` above the line, then `client.name`, which is the same rule as naming the apple before the sentence that uses it. The local is the fallback and it is the weaker answer: two short lines satisfy the audit without the model getting any better, so a round that reaches for it everywhere has moved the problem rather than solved it.
- **No arrow code.** Deep indentation is a visual smell — if the code is marching right across the page, the function is doing too much branching. It means a function should already have been called inside that block: the indented body is a named step that was never named. Extract, invert conditions, return early.
- **Idempotent where possible.** A function called twice with the same input should behave the same way. Side effects should be obvious from the name (`saveUser`, not `processUser`).

## Avoid `else`

Big branching blocks destroy the prose-like flow. Most of the time, `else` is avoidable:

- Return early. Guard clauses at the top of a function eliminate the need for `else` in the body.
- Extract the branches into separately named functions.
- Use a lookup, map, or polymorphism when there are many branches.

`else` isn't banned — sometimes the alternative is genuinely worse (longer, more verbose, less clear). But the default is to avoid it. If you find yourself writing `else`, pause and ask whether early return or extraction would read better.

## Don't Repeat Yourself — But Carefully

Duplication is a signal that something wants to be extracted. When you see the same logic twice, ask:
- Is this *actually* the same concept, or coincidentally similar code? (Coincidental duplication is fine — premature abstraction is worse than duplication.)
- If it's the same concept: extract to a helper, utility, or shared module with a name that captures *the concept*, not the mechanics.

**DRY is a smell-detector, not a law.** Don't contort code to eliminate duplication if doing so makes the code less readable.

## When Rules Conflict

The ranking, when forced to choose:

1. **Readability — does it read like prose?**
2. Short, focused functions and files.
3. DRY.
4. Everything else.

If avoiding `else` would require duplicating five lines, duplicate them. If extracting a helper would require a clumsy name, leave the code inline and rename later when the right abstraction reveals itself. Readability wins.

## Design Patterns Emerge, They Aren't Imposed

I don't reach for Gang of Four patterns by name. I follow the rules above, and when a pattern naturally appears — a factory, a strategy, a decorator — great. But I don't force code into a pattern because it has a name.

The right structure is discovered through writing clean prose-like code, not chosen upfront from a catalogue. Don't suggest "let's use the Observer pattern here" — suggest "this part of the code wants to notify other parts when X changes" and let the shape emerge.

### Once a pattern has emerged, it is a prediction

A design pattern turns the backend and the API into understandable, predictable units — and predictable is the point. Once the codebase shows a pattern (every command has a handler and a validator; every entity has its list view, its detail view and its form), the pattern tells you what *should* exist for every other subject. Work backwards from it: predict the file, find the code that is doing that job somewhere else — inline in a handler, in an endpoint, in a catch-all service — and move it to where the pattern says it lives, pre-emptively, rather than waiting until it hurts.

- **New code lands in the pattern's shape from birth.** Adding an entity or an operation means adding the files the pattern predicts for it, named the way its siblings are named. If you are adding a file with no sibling anywhere in the codebase, say so.
- **File counts should be consistent.** An entity's properties are its complexity, and its complexity dictates how many views it needs and how large the files the patterns force on it are. Across a consistent codebase the number of files per entity sits within a rough, acceptable range of that complexity. An entity far below the range has its work piled into too few files; one far above has a pattern being repeated by hand. Either is a finding.
- **An exception is written down.** A subject that truly has no need of a file its pattern predicts is recorded as an accepted gap, not left to look like an oversight, and never satisfied with an empty file. An entity whose file count is what its pattern makes of it is recorded as an accepted count, with the reason, and never brought into range by renaming or merging files to suit the count.

## Architecture Bias

- **Loose coupling.** Modules should know as little about each other as possible. Prefer composition over inheritance, interfaces over concrete dependencies.
- **Microservice-style thinking even within a monolith.** Each module has a clear responsibility and a small surface. Other modules talk to it through that surface, not its internals.
- **Extensibility through structure, not through configuration.** Adding a feature should mean adding a file or a module, not adding a flag to an existing tangle.

## Anti-Patterns to Avoid

Things I never want to see in code you write for me:

- Abbreviations in identifiers (`usr`, `btn`, `cfg`, `tmp`, `req`, `res`, `ctx` — write them out).
- Booleans without `is`/`has`/`should`/`can` prefix.
- Magic numbers or magic strings inline.
- Functions longer than ~30 lines (soft limit) or files longer than 100 lines (hard limit).
- Deep nesting / arrow code.
- `else` blocks where an early return would do.
- Comments explaining *what* the code does.
- Code duplicated across files when the concept is the same.
- Member chains deeper than one hop (`a.b.c`), and splitting one into a local when the type was yours to model.
- Conditions with calls tangled inside calls (`if (is(getApple(1).colour == "RED"))`), and comparisons against raw literals.
- Accessor functions that glue a type to its property (`getAppleColour()` instead of `apple.colour`), and function names over five words or forty characters.
- Components that leave their functions behind in the parent, or reach back into it.
- A content widget — a table, a heading, a field — that draws its own box; only a container widget draws one.
- Functions that mask something the framework should be doing, and functions or components nothing calls.
- The same function — the same body, not merely the same name — declared in more than one file.
- A subject missing a file its design pattern predicts, or an empty file created to satisfy one.
- An entry point that writes a value without checking it against its column, a check that lives only on the form, and an input quietly truncated or coerced to fit.
- Premature abstraction — extracting "just in case" before the second use exists or the design pattern names it.
- Catch-all utility files (`utils.js`, `helpers.js`) — utilities go in named, focused modules.

## Before You Finish Any Task

Run through this checklist mentally:

1. Does every name say exactly what the thing is?
2. Could a reader understand this file without running it?
3. Is every file under 100 lines, and every function around 30 or fewer?
4. Are there any `else` blocks I could remove with early returns?
5. Are there any inline literals that should be named constants?
6. Did I add any comments? If so, can I rename or restructure instead?
7. Did I introduce duplication? Did I introduce premature abstraction?
8. Does each function do one thing its name describes?
9. Does every condition read as a sentence — nothing fetched or computed inside it, nothing compared to a raw literal?
10. Does every line take at most one hop into an object, and did I model the type rather than reach for a local?
11. Is every function in the right home, and is its existence justified — not a utility stranded in a view, not a workaround for the framework, not uncalled?
12. Does every new file sit where the codebase's design patterns predict it, named as its siblings are, and did I add every file the pattern predicts for what I added?
13. Is every value I write checked against its column at every entry point that writes it — the API, the handler, the MCP tool — rejected rather than repaired, with the form mirroring the same limits?
14. Would the code quality score fall because of this change? Run the fast audit and the gate if the repository carries them.

If any answer is "no" or "I'm not sure", fix it before saying you're done.

## How to Work With Me

- **Match the patterns in the existing codebase** if it follows these rules. If existing code violates them, ask before propagating the violation.
- **Don't add things I didn't ask for** — extra config, extra abstraction, extra files. Minimal change that solves the problem.
- **If you think a rule above is wrong for a specific case, say so explicitly** rather than quietly breaking it. I'd rather have the conversation.
- **When in doubt, choose the boring, readable option** over the clever one.

<!-- project-process:end -->
