# The Refactor Cadence — Architecture

How a repository's code comes back to the standard on a rhythm nobody has to remember: every
push to a project's default branch is a deploy, YBT counts them, and every N of them it raises
a refactor round on the project as the reminder. The round itself is a Claude script in the
repository (the project-process kit's `refactor-round` skill and `tools/refactor/` audit), run by
a person's Claude on its own `refactor/round-N` branch and handed to the person as a pull request
to review and merge. YBT decides *when* and keeps the record; YBT itself never commits, pushes or
opens a pull request.

It adds one small entity and one webhook event. The repository's home already lives on the
project (`repository_url`); the GitHub webhook already reaches `/api/github-webhook`. What was
missing was the count, the rule, and the task.

## The stories

| As | I want | So that |
| --- | --- | --- |
| Project owner | every N deploys of my default branch to raise a refactor round on the project by itself | the code returns to the standard on a rhythm, not when someone remembers |
| Project owner | to see on the project how many deploys have landed since the last round, and to set N | I know when the next round comes and can change the rhythm, or turn it off |
| Anyone on the project | the round to be a task like any other, with the before and after on it | the history of every round is on the project, next to the work it followed |
| Anyone on the project | no CI checks on my pushes, and nothing reaching the default branch until I merge its pull request | a red check never reads as a failed deploy |
| Anyone | to register an old repository mid-way and have the cadence start from then | onboarding is one edit and one webhook, never a migration of history |

## The views

No new pages. The project page (`/projects/[projectId]`) reads a line under the description
when a repository is recorded — *7 of 10 deploys since the last refactor round.* — and its
Edit form gains the repository, the live site, the default branch and *Refactor every … deploys*
(0 turns the cadence off). A round is an ordinary task titled `REFACTOR: round N`, 13 points,
its brief in the details, and its conversation opening with why it was raised. The connector mirrors the
page: `read_project` carries the same line, and `update_project_details` takes the same four
fields.

## The flow

```
push to <default branch> ──▶ GitHub webhook (push) ──▶ /api/github-webhook
                                                              │
                              project_deploys gains one row (delivery id keeps a redelivery to one)
                                                              │
                         deploys since last_refactor_raised_at ≥ refactor_every_deploys, and no round open?
                                                              │ yes
                             task "REFACTOR: round N" raised in the owner's name, brief attached,
                             last_refactor_raised_at stamped, a message saying why
                                                              │
                     the owner's Claude reads it (read_latest_messages / the queue), runs the
                     repository's refactor-round skill on a refactor/round-N branch and opens a
                     pull request; the headline and the PR are posted on the task
                                                              │
                              the person merges; that merge is a push: deploy 1 of the next N
```

The repository can tell on its own, without YBT: `tools/refactor/deploys_since_baseline.sh`
counts the commits on the branch since `baseline.json` was last committed. YBT's count is the
reminder that reaches a person; the script's count is what the `end-of-day` skill reads.

## The entities

**ProjectDeploy** — `project_deploys`: `project_id`, `delivery_id` (GitHub's, unique per
project), `commit_sha`, `branch`, `pushed_at` (the head commit's time, else arrival),
`received_at`. Never updated, never deleted except with its project.

**Project** — gains `default_branch` (`main` unless told otherwise), `refactor_every_deploys`
(10; 0 is off) and `last_refactor_raised_at`. Deploys since the last round are counted from the
rows, never stored.

**Task** — unchanged. A round is a task whose title starts `REFACTOR: round`; its number is one
past the highest ever raised on the project, whatever became of the earlier ones; a round is
open until its status is done, and while one is open no other is raised.

## Commands and queries

| Command | Story it serves |
| --- | --- |
| `handlePushEvent` → `recordDeploy` | a push to the default branch counts once |
| `raiseRefactorRoundIfDue` → `raiseRefactorRound` | the round is raised when the rule says so |
| `updateProjectDetails` (site and `update_project_details`) | the owner sets where the code lives and the rhythm |

| Query | Story it serves |
| --- | --- |
| `countDeploysSinceRefactor` | the line on the project and the rule's input |
| `findProjectsByRepository` | the webhook finds the project(s) a repository belongs to, however the URL was spelled |
| `isRefactorRoundDue` (pure) | the one rule: cadence on, enough deploys, no round open |

`raiseRefactorRound` creates the task in the owner's name, sets its points and brief, stamps the
project, and posts why it was raised. It does not dispatch anything: a person's Claude runs
the round.

## Idempotence

Three places, none of them a flag: a redelivered webhook carries the same `x-github-delivery`
and the unique index turns it into a no-op; an open round blocks a second; the count is
derived from `pushed_at > last_refactor_raised_at`, so raising a round resets it without a
counter to keep in step. Registering an old repository is setting `repository_url` and pointing
its webhook here with push events; the first push after that is deploy one.

## Doctrine on the connector

`get_current_context` now ends with the working doctrine (`src/lib/server/mcp/workingDoctrine.ts`):
read the inbox first; find the task and open its files before touching anything (`FIX: …` for a
bug, a user story for anything else); make repository changes on a branch named for the task,
record it with `set_task_branch`, and hand them over as a pull request the person merges — the
merge marks the task done; leave a work log naming the branch and PR; put files and questions for
other members on the task, passing the baton with `waitingOn`; never raise a refactor round by
hand. `create_task`, `post_message`, `read_latest_messages` and
`update_project_details` carry the same doctrine in their `guidance`. `workingDoctrine.test.ts`
fails the build if the doctrine or any guidance names an action that does not exist.

## Setup, once per repository

Run the project-process bootstrap in the repository (it installs the audit, the round and
end-of-day skills, and the due-check script). Optionally, in YBT, set the project's repository
URL and default branch, and on GitHub have the repository's webhook to
`<ybt>/api/github-webhook` send **push** events as well as pull request events — the same
secret. Without the webhook the repository's own `deploys_since_baseline.sh` still says when a
round is due; with it, the reminder lands on the project.

## Status

Written on 15 September 2026. Migration `0055` is applied and the cadence was deployed on
16 September (d9e4311). On 27 September the connector's doctrine was aligned with the kit's
branching rule (branch, push, pull request, a person merges). The pure rules are under test (`readPushEvent`, `repositoryUrlKey`,
`refactorRoundTitle`, `isRefactorRoundDue`, `workingDoctrine`); the webhook path has not yet
received a live push.
