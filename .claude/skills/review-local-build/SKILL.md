---
name: review-local-build
description: Review a branch the local model built, as the review model, and take it to a merged pull request — read the task and the diff, run the repository's checks and the audit gate, fix what the local model got wrong, open the pull request titled with the task and turn on auto-merge; or send the work back when it is too far off. Use when next_buildable_task hands you a task titled 'Review "<task>" on <branch>', or when the person says "review the local build" or "review this branch the local model built".
---

# Reviewing a local model's build

The local model on the Mac mini builds easy tasks on a branch and never opens a pull request itself. When it pushes, `submit_local_build` records the task built and raises a subtask, *Review "<task>" on <branch>*, on the same branch, buildable and autocomplete, for the review model set in YBT admin. `next_buildable_task` hands that subtask to you. Your job is that nothing the local model wrote reaches the default branch below the standard a Claude session's own work is held to.

## 1. Claim it and read everything

`next_buildable_task` has already recorded *building* on the review task for you. Record `reviewing` on the **parent** task too (`record_lifecycle_step`, with the branch), so every AI looking at the board sees the build is under review. Then read:

- The parent task in full (`read_task`), its acceptance criteria and every attachment. That is what the branch has to deliver — not what the local model says it did.
- The diff against the base branch (`staging` where the repository has one, else the default branch): `git fetch origin`, `git switch <branch>`, `git diff origin/<base>...HEAD`. Read every file it touches, and the siblings it should have copied (the sizing skill names them on the task when the work was sized as a copy).
- The repository's `CLAUDE.md` and `PROJECT.md`. The rules are the same for the local model as for you.

## 2. Run the checks

Run what a contributor runs locally: the repository's type check, tests and build, then the fast audit and the gate:

```
python3 -m tools.refactor.audit.run_audit . --output tools/refactor/audit-output --fast
python3 -m tools.refactor.audit.gate tools/refactor/baseline.json tools/refactor/audit-output/audit.json
```

Do not commit the audit output.

## 3. Fix, or send back

Read the diff adversarially, as a reviewer who has to defend it: does it do what the task says, does every value written get checked at its door, does it read as prose under the rules, does it leave anything uncalled, does a migration protect existing data. Then decide which of the two this is.

**Fixable in review** — the work is the right shape and wants corrections: names, a missing check, a file over the limit, a failing test, a gate figure that moved, a criterion half met. Fix it on the same branch, one commit per verified step, and run the checks again until they pass. This is the usual case.

**Too far off** — the work is the wrong shape: it misreads the task, builds in the wrong place, or would take longer to fix than to build again. Do not rewrite it in review. Send it back:

1. On the parent task, `record_lifecycle_step` with `considered`, outcome `buildable`, and a `note` that begins **"Sent back by review:"** and says in a sentence or two what was wrong. The sizing skill reads these notes before it trusts the local model with similar work.
2. `post_message` on the parent task with what was wrong and what the rebuild should do differently, then `update_task_status` to put it back in the backlog, so the local model takes it again.
3. Mark the review task done with a message saying it was sent back, and record `released` on it.

## 4. Open the pull request

When the checks pass: push the branch, and open the pull request into the base branch titled with the **parent** task's title, its body the work log in short — what the local model built, what review changed and why, and whether it needs a database step. Turn on auto-merge. Record the pull request on both tasks with `set_task_branch` (`pullRequestUrl`), and record `pull_request_open` on the parent task's lifecycle if GitHub has not already.

When it merges, YBT marks both tasks done by themselves. If CI fails, the branch is yours to drive to green, as any pull request you open.

## What this skill never does

- It never merges red, never uses an override, and never merges a pull request it did not open.
- It never rewrites the local model's work wholesale; work that needs that is sent back.
- It never widens the task: anything the parent task did not ask for is raised as a task of its own.
