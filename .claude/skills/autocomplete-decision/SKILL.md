---
name: autocomplete-decision
description: Decide whether a goal or task in Your Business Today goes autocomplete — whether an AI running on a schedule may take it through to a merged pull request without asking anyone. Use when considering a goal or task, when a goal or task is raised, or when the person asks "should this be autocomplete", "decide autocomplete", or "which tasks can the AIs finish on their own". Sets the flag with set_goal_autocomplete or set_task_autocomplete and records why on the lifecycle.
---

# The autocomplete decision

Autocomplete is one flag on a goal and, optionally, on a task. When it is on, an AI running on a schedule may take the work through to a merged pull request without asking anyone; when it is off, a person gives input first. A task with no setting of its own follows its goal, and a task with no goal counts as on. The scheduled AIs read it through `next_buildable_task`, which only hands out autocomplete work, and `read_autocomplete_register` shows where every project stands.

This skill is the one place that decides it, so the flag is set the same way on every project, and tightening it is an edit here, not a rewrite.

## The rule in force: on, always

For now every goal and task is autocomplete. That mirrors the way work was picked up before the flag existed — the scheduled board check took any task — so nothing changes for the person until they choose to tighten it.

1. Read the goal or task (`read_goal` or `read_task`) and its autocomplete line.
2. **If a person turned it off, leave it off.** A setting a person chose is never overridden by this skill, whatever the rules say. Only a person turns it back on. The autocomplete line on `read_task` says whether the task has its own setting; the goal page and `read_goal` show the goal's.
3. Otherwise, when it is not already on, turn it on: `set_goal_autocomplete` with `isAutocomplete: true` for a goal. A task needs nothing: with no setting of its own it follows its goal, which is on. Give a task its own setting with `set_task_autocomplete` only when a rule below that is switched on says it differs from its goal.
4. Record the decision on the lifecycle with `record_lifecycle_step`: the step `considered` is the considering AI's to record once its whole consideration is done, so here add a sentence to that step's `note` — "Autocomplete on: the rule in force says yes to everything." When this skill runs on its own, outside a consideration, record no step; the flag is the record.

## The rules for later, switched off

These are written out so that tightening is switching them on. They are **off**: do not apply them until this section says a rule is on, and the person is the one who switches a rule on, by editing this skill in the kit.

| Rule | State | When on, it says |
|---|---|---|
| Simple features and UI updates | off | On: a task that changes or adds views without changing the data structure. |
| Copies an existing pattern | off | On: a task the sizing skill flags as copying a sibling view, form or handler. |
| Larger features | off | Off: a task of 13 points or more, until a person has read its plan. |
| Goals still being set up | off | Off: a goal with no measure, or with tasks still to be written or sized, until a person has seen it. |
| Needs a person's decision | off | Off: a task whose consideration found it waits on a person. |
| Changes infrastructure | off | Off: a task that needs a secret, a DNS record, a setting in a third-party dashboard or a paid plan. |

When a rule is switched on, its line here changes from `off` to `on` and the rule in force above is rewritten to say which rules apply and in what order. The last two rules overlap with *buildable* (a task that waits on a person or needs infrastructure is not buildable, so no model takes it anyway); they are listed so the flag can say the same thing to a person reading the register.

## What this skill never does

- It never turns off a flag a person turned on, or on a flag a person turned off.
- It never decides whether a task is buildable or which model needs it — that is the considering AI's outcome and the `task-sizing` skill.
- It never changes a task's status, priority or assignees.
