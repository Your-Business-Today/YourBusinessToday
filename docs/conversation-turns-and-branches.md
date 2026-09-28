# Conversation Turns and Task Branches — Architecture

Work on a project now moves as a back and forth between people and their Claudes. Someone wants
a feature; their Claude raises the task through the connector; our Claude asks a question on it;
their Claude answers or brings it to them; and so on until it is built on a branch and merged.
This design makes that back and forth visible: whose turn it is, and where the code is.

## The stories

| As | I want | So that |
| --- | --- | --- |
| Project owner | every top level task raised as a user story unless it is a bug fix | each piece of work says who it is for and why |
| Anyone on the project | to see whose turn it is on each conversation — a person, or their Claude | nothing sits waiting without anyone knowing |
| Anyone on the project | the backlog filtered to what is waiting on me or my Claude | I answer what is mine first |
| Project owner | each task to record the git branch its work is on | I can find the code, and the task closes itself when the branch merges |
| Project owner | to reorder goals on the project screen | the goal that matters most sits first |
| Anyone reading | measures, details and messages laid out as lists and paragraphs | long text reads at a glance |

## The baton

Every message says how it was posted (`posted_via`: on the site, or by a Claude through the
connector) and who must answer next (`awaiting_account_id`, `awaiting_kind`): a person
themselves, or their Claude on its own. The latest message on a goal or task is its turn, read
through the `conversation_turns` view. When the awaited person's Claude calls
`read_latest_messages`, everything waiting on them is stamped `picked_up_at`.

```
  James ──▶ James's Claude ─ ─ ●─ ─▶ Dan's Claude ──▶ Dan
  (passed)      (spoke)          (sent)   (next)       (next)
```

| Stage | Means | Shown as |
| --- | --- | --- |
| quiet | the last message waits on nobody | "Nobody is waiting" |
| sent | waiting on someone; their Claude has not read it yet | the baton in flight to their Claude |
| with_claude | their Claude has it and answers on its own | their Claude glowing |
| with_person | their Claude has brought it to them | the person glowing |

When a Claude does not say who is next, the message waits on whoever spoke last, or failing that
whoever raised the task or goal, and on the person rather than their Claude. On the site the
composer offers the same choice with that default selected.

## Branches

A task has `branch_name`. A Claude records it with `set_task_branch` when it branches, and the
pull request's address when it opens one; `find_task_by_branch` finds the task a session starting
on a branch is working on. GitHub's `pull_request` webhook (the same `/api/github-webhook` and
secret the deploy count uses) records the pull request on every task on that
branch in a project for that repository when it opens, and on merge marks each work task done
with a message saying so. A support task still closes through its resolution, so its merge only
says so on the conversation.

## Status

Written on 27 September 2026. Migration `0059` adds the message columns, the
`conversation_turns` view and `tasks.branch_name`; it must be applied before the deploy that
reads them.
