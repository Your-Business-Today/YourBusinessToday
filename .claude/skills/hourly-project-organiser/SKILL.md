---
name: hourly-project-organiser
description: Hourly tidy of every Your Business Today project in Scoping, Building, Testing or Maintenance: put every goal and task in its department, place goal-less tasks into current goals, order goals and tasks across departments, decide autocomplete, tidy assignments.
---

# Hourly project organiser

Runs every hour, unattended, through the Your Business Today connector (`run_read_action` for the actions that only read, `perform_action` for the ones that write). It organises boards; it never builds, merges, deletes, or changes a project's status. Every run must be **idempotent**: a board that is already in order is left exactly as it is. Move something only for a reason you can state in one sentence, and record that reason.

Agent name for every lifecycle step: `Hourly project organiser`. Model: the model this session runs on.

## How a board is laid out

A project is a business project with a large development part. Every goal and task has a **department**, and the project page shows one tab for each, Development first:

- **Development**: a change to the repository, a bug titled `FIX: …` or a user story, that Claude builds and that ends in a pull request. It is Claude's: nobody is assigned to it, and it is the only department that goes in the build queue.
- **Administration**: the running of the business (insurance, accounts, registrations, contracts, testing what was built).
- **Sales**: winning the work (leads, calls, quotes, follow-ups).
- **Marketing**: being found (site copy, posts, listings, campaigns, launches).

A business task is a job a person does. It is assigned to that person, is titled with the job and never with their name, and they mark it done. Tasks wait for each other across departments with `set_task_waits_for`, for example the site page that publishes the insurance waits for the Administration task that buys it. What a person has to *give* for a task (an answer, a file, a credential, a test) is not a task: it is a message on the task waiting on them, with `askKind` set to `information`, `setup` or `testing`. Personal to-dos are only for jobs that belong to no project.

## 0. Before the first project

1. `get_current_context` once, then `read_latest_messages` (bring nothing to chat — no one is watching; anything addressed to James stays where it is for his own Claude).
2. `list_projects`. Keep every project whose status is **Scoping, Building, Testing or Maintenance**. Skip On hold, Complete and every other status.
3. Work out who is **staff**: everyone listed by `list_project_people` on any **team project** (team projects are on every staff member's board), plus the project owners in step 2. Everyone else is a client contact. Keep this list for the run.

Work the projects in board priority order. For each project, do steps 1–7 below. If the run is running long, finish the project in hand and stop; the next hour carries on.

## 1. Read the project and claim nothing held by another AI

- `find_goals` (no words) for the goals with horizon, status, priority and autocomplete. `read_goal` shows each task's department in brackets (no bracket means Development).
- `read_autocomplete_register` with the `projectId` for every open task and its flag.
- `read_project` only when you need the backlog with each task's goal and parent (it is large — read it in chunks and look only at tasks that are not Done/Resolved).
- **Active goals** are current-horizon goals that are not dropped. Prefer Open ones; a Met current goal is only used for a task that plainly fixes what that goal delivered (adding it reopens the goal, which is correct).
- Before changing a goal or any task under it, `record_lifecycle_step` `considering` on that goal. If it is refused, another AI holds it: leave that goal and its tasks alone this hour. When you are done with a goal, record `released` on it with a one-line note of what you changed (or "no change"). Never leave a claim standing at the end of the run.

## 2. Put every task and goal in its department

For each open task, read its title and details and ask whether it ends in a pull request.

1. **A person's job filed in Development** (deciding, confirming, choosing, a call, an account, testing against live services, a launch, a purchase): move it with `update_task_details` `department` to Administration, Sales or Marketing by the list above (testing goes to Administration), and keep its assignee. If it carries a person's name in the title (`Jeremy: …`, `Directors: …`), retitle it to the job and assign that person instead (step 7).
2. **A code change filed in a business department**: move it to Development.
3. **A Development task asking a person for something** (an answer, a file, a key, a test): leave the task in Development and post the ask on it as a message waiting on that person with its `askKind`; never raise a task for it. The connector refuses an ask that waits on the signed-in person; leave those as they are.
4. **A goal's department** is where most of its open tasks sit. A goal whose measure is a business outcome (insurance in force, apps on the stores, the first client signed) sits in that business department even when a Development task serves it; `update_goal` with `department` moves it. A goal shows on every tab that holds one of its tasks, so never split a goal to tidy its tabs.
5. When the department is not clear from the task, leave it and record why in the goal's `released` note. Never move a task a person placed and explained.

## 3. Place the tasks that have no goal

Look at every open top-level task with no goal (Backlog, In progress or On hold; ignore Done and Resolved). A subtask with no goal whose parent has one takes its parent's goal (`update_task_details` with `goalId`) — no judgement needed.

For each goal-less top-level task:

1. **Respect a person's decision.** If the task's or any goal's details/conversation records that a person wants this task left without a goal (for example "do not move that task beneath this goal or change its unassigned status"), leave it and move on.
2. `read_task`. Decide which active goal's **measure** the task moves forward. Read the measures, not just the titles.
3. **It fits an active goal:** `update_task_details` with that `goalId`. Then order that goal's tasks with the new one in mind (step 4).
4. **It fits no active goal:** never put it under a long-term goal. Check `find_goals` with a few words first, so you never raise a second goal for the same outcome. If several goal-less tasks share one outcome, they share one new goal. Otherwise `create_goal` on the project with `horizon: current`, a one-line title in the project's own words and a measure both sides can check, then `update_task_details` each task onto it. Give it the department its tasks sit in, and place it by step 5. Post one message on the new goal saying which tasks formed it and why no existing goal fitted (waits on nobody).
5. Record the placement in the goal's `released` note.

Moving goals between current and long term is not this skill's job. Tasks already under a long-term goal stay where they are.

## 4. Order the tasks inside each goal you touched

Only for goals that gained a task this run, or whose order breaks one of these rules. Use `place_task` (before/after a sibling) or `set_task_priority`. Order top to bottom:

1. A task another task waits for (`set_task_waits_for`, or a prerequisite named in its details) sits above the task that needs it, whichever department each is in. Where the real-world order is plain (the shareholding paperwork before the director's appointment, the policy bound before its figures go in the contract) and no wait records it, set it with `set_task_waits_for`.
2. `FIX:` tasks for something broken on a live project, and tasks raised by people using a live project, before the owner's own ideas.
3. Work an AI can start now (buildable, nothing waiting on a person) before work blocked on a person or on infrastructure.
4. Small enabling steps (setup, data, a shared widget) before the features that use them.
5. Otherwise keep the existing order. Never shuffle tasks the rules do not separate.

## 5. Check the goal order

Current goals only, with `place_goal` or `set_goal_priority`. A goal moves only when one of these is true:

1. Another goal depends on it (its measure or tasks need this goal's output) and it sits below it.
2. A goal carrying live `FIX:` work or work requested by people using a live project sits below a goal of the owner's own ideas.
3. A newly made goal is placed straight after the goal it most depends on, or last if none.

Met goals can sit anywhere; do not move them. Record each move's reason in the goal's `released` note.

## 6. Decide autocomplete for every open task

The flag says whether a scheduled AI may take a task to a merged pull request with nobody reviewing it. Set it per task with `set_task_autocomplete` (`on` or `off`). Do not change goal flags.

**A business task is always off.** Administration, Sales and Marketing tasks are done by a person and never built, so set them `off` and record `Autocomplete off: a person does it ({department}).` A task moved out of Development by step 2 gets this even if a decision was recorded before.

**Decide each Development task once, and never override a person.**

- `read_lifecycle` on the task. If a step by `Hourly project organiser` already records an autocomplete decision and the flag still matches it, skip the task. If the flag now differs from that decision, a person changed it: leave it forever.
- With no decision recorded: if the task is **off, set on the task**, and it was raised by **staff** (`read_task_conversation` shows who raised it), a person chose that — leave it and record "left off: set by a person". If it is off because a client contact raised it (those arrive off), or it follows its goal, decide it below.

**Off — needs James's review** when any of these is true:

- **Cost:** a new paid service, plan, API with usage charges, or a bigger hosting tier; or a volume that pushes standard infrastructure (millions of files, large video or image storage, bulk AI generation, heavy compute).
- **Infrastructure:** secrets, DNS, a third-party dashboard, CI or deploy pipelines, hosting, a new external service.
- **Design patterns:** it changes how the system is built rather than adding to it — a new architectural pattern, framework or library; restructuring how commands, queries, handlers or widgets work; reshaping or dropping data already in use.
- **People:** it waits on a person's answer or decision, or is a support question. (A person's own job is not a Development task: step 2 moves it.)
- The story is too vague to tell which of the above applies.

**On** otherwise, and in particular:

- UI-only work with no database or infrastructure change — these go through.
- Another feature or fix within the patterns already built, even when it adds a table or column the way its siblings do.

Record the decision with `record_lifecycle_step` on the task: `considering` then `released`, the `released` note starting `Autocomplete on:` or `Autocomplete off:` and one sentence of reason. Never record `considered` — that changes the task's buildable tag, which is not this skill's call.

## 7. Tidy assignments and waits

Last, for the project's open tasks:

1. Every Administration, Sales and Marketing task is assigned to the person who does it (`set_task_assignees` replaces the whole list — keep everyone already on it who should stay). Where the task's details or conversation name them, assign them; where nothing says who, leave it unassigned and post one message on the task waiting on the project's owner asking whose it is (not when the owner is the signed-in person).
2. A task titled with a person's name is retitled to the job (`update_task_details` `title`) and assigned to them.
3. A Development task has nobody assigned: it is Claude's. Take people off it with `set_task_assignees` and an empty list, and record it in the goal's `released` note. A person who has to give something for it gets an ask (step 2), not the task.
4. Nobody is assigned who is no longer on the project (`list_project_people`).
5. A task held up by another task waits for it (`set_task_waits_for`), not on hold with a note, including across departments.
6. `read_ybt_summary` once per run gives the open questions waiting on people. Where a later message on the same thread has plainly answered one, post `waitingOn: "nobody"` with one line saying what settled it. Where a question waits on someone not on the project, or on the wrong person, say so on the task as a message waiting on the right staff member.
7. Never assign James to a task to make it look owned, and never mark anything done.

## What this skill never does

- Never deletes a task or goal, changes a project's status, or moves goals between current and long term.
- Never puts a task under a long-term goal.
- Never puts an Administration, Sales or Marketing task in the build queue or turns its autocomplete on.
- Never raises a task for what a person must give; that is an ask on the task it serves.
- Never overrides an autocomplete flag a person set.
- Never builds, branches or opens a pull request.
- Never messages a person in chat; anything a person must see goes on the task or goal.
- Never makes a change it cannot give a reason for; no change is the right outcome for a tidy board.
