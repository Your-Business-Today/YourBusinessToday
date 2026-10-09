# The Project Feed — Architecture

Until now a person who raised a task found out it was finished by opening it. The feed is the
live record of the work moving — every task raised, started, put on hold, sent for review or
done, as it happens, newest first, like the score page of a match — and the person a task was
raised for is told on the bell when it is done, whichever door marked it so.

## The stories

| As | I want | So that |
| --- | --- | --- |
| A person who raised a task | to be told when it is done | I know the work I asked for has landed without opening every task |
| Anyone on a project | a feed of every move across my projects as it happens | I see what is going on without reading every backlog |
| A person who raised tasks | the feed filtered to the tasks I asked for | my own asks stand out from everyone else's |
| A Claude working through the connector | to read the same feed | I can tell my person what landed since they last looked |

## The model

`project_events` (migration `0072`) holds one row per move: the project and task, the `kind`
(`task_raised`, `task_started`, `task_put_on_hold`, `task_returned_to_backlog`,
`pull_request_opened`, `task_done`), who made it (`actor_account_id`), who the task is for
(`for_account_id`: `requested_by`, or whoever raised it) and, for a pull request, its address in
`detail`. A trigger on `tasks` writes the rows, so every door is covered: the site, the
connector, and GitHub's webhook marking a task done when its pull request merges.

Who made a status move is `tasks.status_set_by`, written by every door that changes a status
beside the status itself — the connector runs as the service role, so `auth.uid()` is empty
there and the row has to say. A merged pull request sets it to nothing, and the feed credits the
merge. A task raised credits `created_by`; a pull request opened credits the signed-in person,
or the connector.

A task done also puts one notification on the bell of the person it is for, unless they made the
move themselves. `notifications.event_id` carries it beside `message_id` and `comment_id`, and
`0060`'s clearing of a done task's notifications runs first (triggers fire in name order), so
the new notification survives it.

## The views

- `/projects/feed` — the day's score (done, started, raised, sent for review), then the events
  grouped by day. An event on a task the viewer asked for is marked *Yours*; the chips switch
  between everything and only those (`?scope=mine`). The page re-reads its load every half
  minute while open (`LiveRefresh`), so a merge shows without a reload.
- `/notifications` — a done task reads as *James finished the task you asked for, …*, with the
  merge credited when nobody signed in did it.
- `read_project_feed` on the connector — the same rows as sentences, one per line, with
  *yours* on the viewer's own asks and the pull request address when there is one.

## Guards

The feed only reads: row level security shows `project_events` on the projects the person can
reach, and both doors pass the reachable project ids besides. The rows are written by the
trigger alone, as the function owner, so no door writes them by hand.

## Status

Written on 9 October 2026. Migration `0072` must be applied before the deploy that reads it;
the events start from then — nothing is backfilled, because the earlier moves were never
recorded.
