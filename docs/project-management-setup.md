# Project Management Setup

Internal project management for the team: projects, phases, sprints, prioritised task
backlogs, user stories with acceptance criteria, story points, completion tracking,
due dates, multiple assignees and roles, comments, and in-app notifications — visible
only to staff and admins.

## One-time database setup

Run these in the Supabase SQL editor, in order (each is run-once):

1. [`docs/sql/project-management.sql`](./sql/project-management.sql) — staff flags,
   `projects`, `tasks`, `task_comments`, and the access functions.
2. [`docs/sql/project-management-upgrade.sql`](./sql/project-management-upgrade.sql) —
   `phases`, `sprints`, `task_assignees`, `task_roles`, `acceptance_criteria`, and
   `notifications`, plus the new task columns (story points, completion, user story
   fields). Existing single assignees migrate into `task_assignees` and the old
   `assignee_id` column is dropped. A database trigger raises a notification for every
   assignee (except the author) when a comment lands on their task.

## How access works

- **Admin** (`is_admin`) — everything staff can do, plus `/admin`, where the
  "Make staff" / "Remove staff" button flips `is_staff` for any account.
- **Staff** (`is_staff`) — sees the Projects link in the header and has full access to
  `/projects`. Every staff member has a personal project list and task queue; both
  views open on your own and the Viewing selector switches to any colleague's. Lists
  are personal but not private: whoever you're viewing, you can edit everything, and
  a project created while viewing a colleague lands on their list. Requires a one-time
  run of [`migrations/0008_personal_project_lists.sql`](../migrations/0008_personal_project_lists.sql),
  which assigns every existing project to James.
- Everyone else — no Projects link; visiting `/projects` redirects home.
- Notifications are personal: each account only ever sees its own.
- Marking a task done clears every notification about it, for every recipient, so the
  bell only counts what still needs someone. The messages on the task stay; reopening
  the task brings nothing back; a message posted on a done task notifies as normal
  (`migrations/0060_done_task_clears_notifications.sql`).

## The views

- `/projects` — the viewed staff member's projects (yours by default), with open-task
  counts, how many of them are assigned to you, and creation. The Task view button leads to
  the same person's task queue.
- `/tasks` — the viewed staff member's top-level tasks in one paginated queue, ordered
  by global priority, each labelled with its project. Open tasks show by default; the
  All filter reveals Done; Assigned to me lists every open task assigned to you across
  every project you are on, soonest due first. The ▲ ▼ controls reorder the queue, and
  the status pill works in place.
- `/projects/[projectId]` — phases (with weighted completion bars and an add-phase form)
  above the prioritised backlog. New tasks join the bottom; the ▲ ▼ controls reorder, so
  the top row is always the next thing to spend Claude on. Each row shows its phase,
  assignees as pills (yours highlighted), story points, and completion; the status pill
  cycles Backlog → In progress → Done in place. Above the backlog a chip per person carries
  their count of open assigned tasks — yours reads "Assigned to me" — and selecting one
  narrows the backlog to that person's tasks.
- `/projects/[projectId]/sprints` — create sprints (with optional start and end dates)
  and see each sprint's task count and weighted completion.
- `/projects/[projectId]/sprints/[sprintId]` — the tasks in a sprint, drawn from any
  phase, in backlog priority order.
- `/projects/[projectId]/tasks/[taskId]` — full task editing: title, details, status,
  due date, phase, sprint, Fibonacci story points (1 2 3 5 8 13 21, default 2),
  completion %, the user-story fields, assignees, and roles — plus acceptance criteria
  and the comment thread.
- `/notifications` — comments on tasks assigned to you, newest first, with unread
  markers; the header bell shows the unread count.
- `/account` — set the display name shown on assignments and comments.

## The models

- **Priority** is a rank. Every ordered layer — projects on an owner's board, goals on
  a project, tasks under one parent (top level or subtasks), and the queue across every
  project — is a *ranked set*: within its scope the numbers are always exactly 1..n, 1 at
  the top. Setting a number puts the row there and shifts the others; up/down and
  before/after are the same operation. Deleting, reparenting or moving a project between
  owners closes the gap it leaves. The engine is `src/lib/server/ordering/`; each layer
  has a scope file (`projectBoard`, `goalOrder`, `taskSiblings`, `taskQueue`) and a
  `set…Priority` command. Migration
  [`0056_dense_priority_ranks.sql`](../migrations/0056_dense_priority_ranks.sql)
  compacted the existing values once and taught `transfer_project_ownership` to re-rank.
- **Queue position** (`global_priority`) is the rank across every top-level task on the
  projects one person owns — the order of `/tasks`. The two orderings never contradict:
  reordering siblings deals their queue positions out again in the new order, and a queue
  move re-deals the moved task's project backlog to match. New top-level tasks join the
  bottom of the queue; subtasks stay out of it. Done tasks keep their position, so the
  numbers on `/tasks` may skip when done tasks are hidden.
- **Completion** is a manual 0–100 % on each task. Phase and sprint percentages are
  derived, weighted by story points, so a 5-point task moves the bar more than a
  1-point one. Marking a task done sets it to 100 %.
- **User stories** — any task can become one: *as* a role, *I want* a feature,
  *so that* a benefit. Stories are marked ◆ in lists and carry acceptance criteria,
  each of which can be checked off as met.
- **Sprints** cut across phases: a sprint is any set of the project's tasks, whatever
  stage they belong to.
- **Roles** come from the fixed list in `src/lib/data/taskRoles.ts` — edit that file to
  change the roles on offer.
