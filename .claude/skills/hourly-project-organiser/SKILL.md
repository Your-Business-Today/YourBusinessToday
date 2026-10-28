---
name: hourly-project-organiser
description: Hourly tidy of every Your Business Today project in Scoping, Building, Testing or Maintenance: place goal-less tasks into current goals, order goals and tasks, decide autocomplete, tidy assignments.
---

# Hourly project organiser

Runs every hour, unattended, through the Your Business Today connector (`run_read_action` for the actions that only read, `perform_action` for the ones that write). It organises boards; it never builds, merges, deletes, or changes a project's status. Every run must be **idempotent**: a board that is already in order is left exactly as it is. Move something only for a reason you can state in one sentence, and record that reason.

Agent name for every lifecycle step: `Hourly project organiser`. Model: the model this session runs on.

## 0. Before the first project

1. `get_current_context` once, then `read_latest_messages` (bring nothing to chat — no one is watching; anything addressed to James stays where it is for his own Claude).
2. `list_projects`. Keep every project whose status is **Scoping, Building, Testing or Maintenance**. Skip On hold, Complete and every other status.
3. Work out who is **staff**: everyone listed by `list_project_people` on any **team project** (team projects are on every staff member's board), plus the project owners in step 2. Everyone else is a client contact. Keep this list for the run.

Work the projects in board priority order. For each project, do steps 1–6 below. If the run is running long, finish the project in hand and stop; the next hour carries on.

## 1. Read the project and claim nothing held by another AI

- `find_goals` (no words) for the goals with horizon, status, priority and autocomplete.
- `read_autocomplete_register` with the `projectId` for every open task and its flag.
- `read_project` only when you need the backlog with each task's goal and parent (it is large — read it in chunks and look only at tasks that are not Done/Resolved).
- **Active goals** are current-horizon goals that are not dropped. Prefer Open ones; a Met current goal is only used for a task that plainly fixes what that goal delivered (adding it reopens the goal, which is correct).
- Before changing a goal or any task under it, `record_lifecycle_step` `considering` on that goal. If it is refused, another AI holds it: leave that goal and its tasks alone this hour. When you are done with a goal, record `released` on it with a one-line note of what you changed (or "no change"). Never leave a claim standing at the end of the run.

## 2. Place the tasks that have no goal

Look at every open top-level task with no goal (Backlog, In progress or On hold; ignore Done and Resolved). A subtask with no goal whose parent has one takes its parent's goal (`update_task_details` with `goalId`) — no judgement needed.

For each goal-less top-level task:

1. **Respect a person's decision.** If the task's or any goal's details/conversation records that a person wants this task left without a goal (for example "do not move that task beneath this goal or change its unassigned status"), leave it and move on.
2. `read_task`. Decide which active goal's **measure** the task moves forward. Read the measures, not just the titles.
3. **It fits an active goal:** `update_task_details` with that `goalId`. Then order that goal's tasks with the new one in mind (step 3).
4. **It fits no active goal:** never put it under a long-term goal. Check `find_goals` with a few words first, so you never raise a second goal for the same outcome. If several goal-less tasks share one outcome, they share one new goal. Otherwise `create_goal` on the project with `horizon: current`, a one-line title in the project's own words and a measure both sides can check, then `update_task_details` each task onto it. Place the new goal by step 4. Post one message on the new goal saying which tasks formed it and why no existing goal fitted (waits on nobody).
5. Record the placement in the goal's `released` note.

Moving goals between current and long term is not this skill's job. Tasks already under a long-term goal stay where they are.

## 3. Order the tasks inside each goal you touched

Only for goals that gained a task this run, or whose order breaks one of these rules. Use `place_task` (before/after a sibling) or `set_task_priority`. Order top to bottom:

1. A task another task waits for (`set_task_waits_for`, or a prerequisite named in its details) sits above the task that needs it.
2. `FIX:` tasks for something broken on a live project, and tasks raised by people using a live project, before the owner's own ideas.
3. Work an AI can start now (buildable, nothing waiting on a person) before work blocked on a person or on infrastructure.
4. Small enabling steps (setup, data, a shared widget) before the features that use them.
5. Otherwise keep the existing order. Never shuffle tasks the rules do not separate.

## 4. Check the goal order

Current goals only, with `place_goal` or `set_goal_priority`. A goal moves only when one of these is true:

1. Another goal depends on it (its measure or tasks need this goal's output) and it sits below it.
2. A goal carrying live `FIX:` work or work requested by people using a live project sits below a goal of the owner's own ideas.
3. A newly made goal is placed straight after the goal it most depends on, or last if none.

Met goals can sit anywhere; do not move them. Record each move's reason in the goal's `released` note.

## 5. Decide autocomplete for every open task

The flag says whether a scheduled AI may take a task to a merged pull request with nobody reviewing it. Set it per task with `set_task_autocomplete` (`on` or `off`). Do not change goal flags.

**Decide each task once, and never override a person.**

- `read_lifecycle` on the task. If a step by `Hourly project organiser` already records an autocomplete decision and the flag still matches it, skip the task. If the flag now differs from that decision, a person changed it: leave it forever.
- With no decision recorded: if the task is **off, set on the task**, and it was raised by **staff** (`read_task_conversation` shows who raised it), a person chose that — leave it and record "left off: set by a person". If it is off because a client contact raised it (those arrive off), or it follows its goal, decide it below.

**Off — needs James's review** when any of these is true:

- **Cost:** a new paid service, plan, API with usage charges, or a bigger hosting tier; or a volume that pushes standard infrastructure (millions of files, large video or image storage, bulk AI generation, heavy compute).
- **Infrastructure:** secrets, DNS, a third-party dashboard, CI or deploy pipelines, hosting, a new external service.
- **Design patterns:** it changes how the system is built rather than adding to it — a new architectural pattern, framework or library; restructuring how commands, queries, handlers or widgets work; reshaping or dropping data already in use.
- **People:** it is a person's own job ("Jeremy: …", "Get Nigel's workbook"), waits on a decision, or is a support question.
- The story is too vague to tell which of the above applies.

**On** otherwise, and in particular:

- UI-only work with no database or infrastructure change — these go through.
- Another feature or fix within the patterns already built, even when it adds a table or column the way its siblings do.

Record the decision with `record_lifecycle_step` on the task: `considering` then `released`, the `released` note starting `Autocomplete on:` or `Autocomplete off:` and one sentence of reason. Never record `considered` — that changes the task's buildable tag, which is not this skill's call.

## 6. Tidy assignments and waits

Last, for the project's open tasks:

1. A task titled with a person's name ("Jeremy: …", "Directors: …") or that only a named person can do is assigned to that person (`set_task_assignees` replaces the whole list — keep everyone already on it who should stay).
2. Coding work an AI builds is assigned to staff, never to a client contact alone.
3. Nobody is assigned who is no longer on the project (`list_project_people`).
4. A task held up by another task waits for it (`set_task_waits_for`), not on hold with a note.
5. `read_ybt_summary` once per run gives the open questions waiting on people. Where a later message on the same thread has plainly answered one, post `waitingOn: "nobody"` with one line saying what settled it. Where a question waits on someone not on the project, or on the wrong person, say so on the task as a message waiting on the right staff member.
6. Never assign James to a task to make it look owned, and never mark anything done.

## What this skill never does

- Never deletes a task or goal, changes a project's status, or moves goals between current and long term.
- Never puts a task under a long-term goal.
- Never overrides an autocomplete flag a person set.
- Never builds, branches or opens a pull request.
- Never messages a person in chat; anything a person must see goes on the task or goal.
- Never makes a change it cannot give a reason for; no change is the right outcome for a tidy board.
