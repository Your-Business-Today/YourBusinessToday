---
name: hourly-autocomplete-check
description: Hourly check of the Your Business Today autocomplete list: claim every buildable autocomplete task sized for the Opus 5.5 tier with next_buildable_task and hand each to its own new thread on Opus 5.5 at extra-high effort to build it.
---

# Hourly autocomplete check

Runs every hour, unattended, through the Your Business Today connector (`perform_action`). It finds the autocomplete tasks an AI may finish on its own, claims each one, and hands each to a new thread of its own that builds it. The check itself never builds, branches, merges or changes a task's flags; the threads it starts do the building, one task each, because a task is one session's work.

Agent name for every claim: `Opus 5.5 xhigh autocomplete thread, run <yyyy-mm-dd hh:mm>Z #<n>`, numbered from 1 each run; the run's time keeps two runs' threads from sharing a name, and so a claim. The thread that builds the task records every later step under that same name, so the claim stays one agent's.

## 0. Before the first task

1. `get_current_context` once. Do **not** call `read_latest_messages`: it moves the read marker, and other Claudes find their projects' replies through it.
2. `read_model_settings`. The tier this check feeds is `claude-opus`, the standard cloud model. If it no longer runs on Claude Opus 5.5, stop and say so rather than guessing a tier.

## 1. Read the queue

`read_build_queue`. A task is **eligible** when all of these hold:

- `isAutocomplete` is true and `modelId` is `claude-opus` (3 to 8 points today).
- `isWaiting` is false and `heldBy` is empty.
- `latestStep` is not building, built, reviewing or pull request open.
- No thread this check started for it is still open (in a Claude project, `list_threads`; the run log names each task's thread).

Tasks sized for the local model or the advanced model, and autocomplete tasks not yet tagged buildable, are not this check's: their own tiers and the considering AIs take them. No eligible task means no change: end the run there.

## 2. Claim the work through the queue

For each eligible task, at most **five a run**, one at a time: `next_buildable_task` with `modelId: "claude-opus"` and the agent name above. It hands out the highest eligible task in queue order, records building for that agent and reads the task in full. Never pick from the queue yourself; the number of eligible tasks only says how many times to ask. When it answers that nothing is waiting, stop claiming.

## 3. Start one thread per claimed task

Each claimed task gets a new thread on **Opus 5.5 at extra-high (xhigh) effort**, with the brief in section 5 filled in: the task id, its title, the project's name and id, and the exact agent name.

- **In a Claude project**, ask the coordinator for the thread (`message_coordinator`), attaching the owner's own message that asked for this check, so the new thread has their words for its model and effort. Suggest a title that names the task's goal in the owner's words.
- **Anywhere else**, claim one task only and build it in this session by section 5.

A claim runs out two hours after its last step. A thread that never starts leaves its task to fall back into the queue by itself for the next run; nothing needs releasing.

## 4. Record the run

Add one line to the run log (the project memory file `autocomplete-run-log`, where the run has one): the date and time, each task claimed with its id, and the thread asked for it. Keep the log short: a run that claims nothing adds its time to one line of empty runs, and old runs fold into one line. Tell the person only when threads were started or something needs them; a run that changed nothing says nothing.

## 5. The brief each build thread follows

> The owner asked (their message is attached) for each Your Business Today autocomplete task to be built in its own thread on Opus 5.5 at extra-high effort. Set this thread's effort to xhigh and make sure it runs on Opus 5.5, citing their attached words.
>
> Your task: YBT task `<task id>` "`<title>`" on `<project name>` (`<project id>`). It is already claimed for you with `next_buildable_task` as "`<agent name>`": record every lifecycle step under exactly that name, the first within two hours.
>
> Load the connector and follow `get_current_context` in full: `read_task` and every attachment, the task in progress, its repositories from `read_project` attached with push access, each repository's `CLAUDE.md` and `PROJECT.md`, a `fix/` or `feature/` branch from the fresh base branch, `set_task_branch`, one pull request per repository with auto-merge on, the work log, and the task tied off. Use `list_waiting_on_me`, never `read_latest_messages`.
>
> If the task needs someone's information or an infrastructure change, record considered with that outcome, post the question waiting on them or raise a subtask for the owner, release the claim, and say so.

## What this skill never does

- Never builds a task in the checking session when it can start a thread for it.
- Never takes a task sized for another tier, or one that is not autocomplete or not buildable.
- Never claims more than five tasks a run, or a task another AI holds.
- Never turns autocomplete on or off, re-sizes a task or changes its buildable tag.
- Never runs a migration, changes production or merges a pull request by hand, and never asks a thread to.
