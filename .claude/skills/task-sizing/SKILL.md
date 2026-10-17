---
name: task-sizing
description: Size a coding task in Your Business Today the same way on every repository — count the existing views it changes, the new views it creates, whether the data structure changes and the domain objects it involves, record them with record_complexity so they set its story points, and name the model it needs. Use when considering a task, when a task has no complexity yet, or when the person says "size this task", "how big is this", "which model should build this" or "point the backlog". Not for deciding autocomplete (autocomplete-decision) or reviewing a build (review-local-build).
---

# Sizing a task

A task's size is four counts, and the story points follow from them by one formula, so sizing reads the same on every repository and every AI. YBT holds the formula; this skill is how the counts are taken. The model that builds the task follows from its points through the build models set in YBT admin (`read_model_settings`).

Read before counting:

1. **The task in full** — `read_task`, and every attachment with `read_task_attachment`. The story and its acceptance criteria say what a user will see.
2. **What the site is today** — `tools/refactor/site-definition.md`, every route as a user sees it. If the repository has none, run the widget identification first (it is read-only), or read the routes directly. YBT's `read_project_site_map` reads the same thing.
3. **The domain** — YBT's `read_project_domain`, or the schema and migrations in the repository: the entities and their fields.

## The four counts

- **Views changed** — existing routes or screens whose markup, data or behaviour changes. A component shared by several views counts once, under the view a user would name. A connector action counts as a view: it is a person's Claude's screen.
- **New views** — routes, screens, dialogs a user opens, or connector actions that do not exist yet. A new component inside an existing view is a view changed, not a new view.
- **Data structure changes** — true when a table, column, constraint, index or enum value is added or changed: a migration in the branch. Reading an existing column in a new place is not a change.
- **Domain objects** — the distinct entities the work reads or writes, as the domain names them (a task, its goal, a lifecycle step: three).

Record them with `record_complexity`. YBT answers with the points the formula gives — views changed + 2 × new views + 3 for a data structure change + domain objects, banded onto 1, 2, 3, 5, 8, 13, 21 — and says when the task must be split.

## Split before it is sized again

Anything that comes to more than 13 points is more than one session's work. Split it before sizing it again: one subtask per step a session can finish and tie off, each with `create_task` (`parentTaskId` the task, `waitsForTaskId` the step before it) and each sized in turn with this skill. Record the split on the parent with `record_lifecycle_step` (`considered`, outcome `needs_splitting`). A task of 13 points is sized as it is and goes to the model whose range holds 13.

## Copying a pattern is the local model's work

When the work copies a pattern the repository already shows — a sibling view, form, handler, connector action or migration to follow, named the way its siblings are — say so on the task with `post_message`, naming the sibling files, and say it in the considered step's note: "Copies <sibling>; suited to the local model." Simple, copyable work belongs to the local model even when its count lands in a higher range; name the local model on the task with `set_task_buildable` (`modelId` from `read_model_settings`). Hard work with no sibling to copy — a new kind of view, a new integration, a design that has to be found — goes to the model its points give, and to Fable when it is at the top of the scale.

## The model

Leave `modelId` out of `set_task_buildable` to let the points choose; name a model only for the pattern case above or when a review sent the work back (below). `read_task` then says which model it is buildable by.

The `review-local-build` skill sends a task back when the local model got it too far wrong to fix in review, and says so on the lifecycle. Before naming the local model for a task, read the lifecycle notes of the tasks it copies (`read_lifecycle`): a sibling that was sent back is a sign the local model cannot do this kind of work yet, and the points' model is the safer choice.

## What this skill never does

- It never sets story points by hand — the formula sets them, and a person may still change them afterwards.
- It never marks a task buildable when it needs a person's answer or an infrastructure change; that is the considered outcome `waiting_on_person` or `needs_infrastructure`.
- It never decides autocomplete — that is `autocomplete-decision`.
