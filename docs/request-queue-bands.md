# Requests Lead the Queue — Architecture

Written on 5 October 2026.

An owner's queue is one ranked list of top level tasks across every project they own. Every new
task used to join its bottom, so what the people using a project asked for for their day job sat
behind the owner's long-term ideas: Jeremy's Weekly Cashflow stories were at positions 670 to
790, behind 192 of James's own tasks, 119 of them on projects that were scoping or on hold.

## The stories

| As | I want | So that |
| --- | --- | --- |
| Project owner | tasks requested by the people who use my projects worked before my own long-term ideas | what they need for their day job gets done and pipedream work is deferred |

## The bands

| Band | Holds |
| --- | --- |
| 1 | requests: asked for by someone other than the project's owner, on a live project (building, testing, maintenance) |
| 2 | the owner's own work on a live project |
| 3 | everything on a project that is scoping, on hold or complete |

Who asked is `tasks.requested_by`, or failing that whoever raised the task. A Claude raising a
task for someone else names them with `create_task`'s `requestedBy`.

The database keeps the bands (migration `0068`), so it holds whoever writes the task and
whatever their row-level access:

- `task_joins_its_queue_band`: a task joining the queue — inserted, made top level, moved to
  another project, or given a requester — goes in at the end of its band.
- `project_status_moves_its_queue_band`: a project moving between live and not sends its tasks
  to the end of their new band.
- A task moved by hand is never moved back: the bands decide where a task starts, not where it
  must stay.

The queue on the site and `read_task_queue` say who requested each request.
