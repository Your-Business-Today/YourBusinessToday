# Task Sequences — Architecture

Some tasks cannot start until another is done: create the Play Console account, then verify the
organisation, then pay the fee, then upload a build. Each task now records the one task it waits
for, and following those links back and forward gives the sequence the task sits in. The site shows
every step where the sequence has got to and what it waits for, so nobody starts a step before the
one it depends on is done, and the person a step is assigned to sees plainly that it is waiting.

## The stories

| As | I want | So that |
| --- | --- | --- |
| Anyone on a project | a task to say which task it waits for | the order the work is done in is recorded, not remembered |
| Anyone on a project | a series of tasks each waiting for the one before to show as a sequence, step by step | I can see where the sequence has got to at a glance |
| The person a step is assigned to | the task page, the backlog and my assigned list to say the task is waiting for an earlier step | I do not start it too soon |
| The person the next step is assigned to | to be told on the task's conversation when the step before is done | I know I can start without checking |
| A Claude raising work through the connector | to raise a series of steps as a sequence and assign each step | the sequence is in place from the moment the work is raised |

## The model

A task has `waits_for_task_id` (migration `0071`): the one task it waits for, on its own project.
A task waits for one task, so a sequence is a chain; where two tasks wait for the same task the
chain forward follows the first by priority, and the other still shows what it waits for. The data
module `src/lib/data/taskSequence.ts` reads a task's sequence from its project's tasks:

- `readTaskSequence(task, tasks)` — the steps in order (the chain back to the first task that waits
  for nothing, this task, then the chain forward), this task's step number, and the step still
  holding it up: the task it waits for, while that task is not done.
- `taskWaitingFor(task, tasks)` — that held-up reading alone.
- `comesAfter(candidate, earlier, tasks)` — whether the candidate's chain reaches the task, which is
  what makes waiting for it a loop.

`taskSequenceStanding.ts` is the list view of the same facts: each task's standing (what it waits
for, and whether that still holds it up) for the backlog and the tasks list, the tasks a task may
wait for (the open ones that do not come after it), and `waitsForRefusal`, the one reason a link
is refused by every door.

### Guards

- The service is the guard: `setTaskWaitsFor` on the task page's save and on `set_task_waits_for`
  reads the project's tasks and refuses itself, a task on another project, and a task that comes
  after it; `newTaskSequenceRefusal` does the same for a task raised with `waitsForTaskId`.
- The database backs it: a trigger refuses the same three cases whichever door the write comes
  through, using `task_comes_after`, a recursive walk of the chain.
- A task that moves project drops its links to the tasks it leaves behind in both directions
  (`dropSequenceLinksAcrossProjects`); links within the family it takes with it travel too.
- Deleting a task sets the links to it null, so the tasks that waited for it start whenever.

### Telling the next step

When a task is marked done, a trigger posts on the conversation of every open task waiting for it:
*"<title>" is done, so this task, which was waiting for it, can start.* The message is posted as the
person who finished it, or the project's owner when a merged pull request did, so the next step's
assignees are told through the usual notification and nobody is handed a baton.

## Where it shows

| Where | What |
| --- | --- |
| Task page | A note at the top: *Waiting for step 2 of 4 to be done before this can start*, naming the step, its status and who has it; or *Ready to start — step 1 is done*. A Sequence panel draws the track: every step a numbered circle, done steps ticked, this task ringed, the step holding it up pulsing, each linked to its task. |
| Edit task | A *Waits for* choice among the project's open tasks that do not come after it. |
| New task / subtask | The same choice among the siblings it is raised beside, so a sequence of steps is raised in order. |
| Backlog and `/tasks` | A pill on each task that waits for one: *Waits for X* while X is open, *After X* once X is done. |
| Connector | `read_task` lists the sequence step by step and names what the task waits for; `read_team_tasks` and `read_task_queue` say *waiting for "X"* on a held-up task; `set_task_waits_for` and `create_task`'s `waitsForTaskId` write the link. |

## The doctrine

A task held up by another used to go on hold with a message naming it, which nothing could read.
The working doctrine (rule 6) and the raising doctrine now say: a task that cannot start until
another is done waits for that task; a series of steps in a fixed order is one task per step, each
waiting for the one before and assigned to whoever does it. On hold is for work stopped for another
reason.

## Status

Written on 9 October 2026. Migration `0071_task_sequences.sql` must be applied before the deploy
that reads the column.
