# Goals, Support Tasks and Conversations — Architecture

How two people's Claudes talk to each other about a project without anyone pasting replies
into WhatsApp: the project's own hierarchy becomes the shared board, every goal and task
carries a conversation, and "what is new" is one call.

Before this, a client contact raised a *feature request* beside the backlog, the thread
lived on the request, and the task the request became was staff-only. The conversation
stopped being the work the moment it was accepted. This folds the request into the task
and puts the conversation where the work is.

## The abstraction

**The hierarchy is the shared board.** Project → Goal → Task → Subtask. A goal is high
level and measurable; its tasks are how it gets met; subtasks are tasks with a parent, as
before. Everything below the project carries one conversation.

**A support task is a task with a raiser and a resolution.** Tasks gain a `kind`: `work`
(planned by us) or `support` (somebody raised it and is waiting on an answer). A support
task is still a task — it sits under a goal or beneath another task, it can go to the
Builder, and it is found by the same search — but it closes with a `resolution` the raiser
reads, word for word. The raiser is `created_by`; nothing is stored twice.

**Access is membership.** Anyone who is not staff reaches a project because an
administrator added them to it — never because of the company their contact record names.
`project_members` is the whole gate, on the site and on the MCP server alike.

## The stories

| As | I want | So that |
| --- | --- | --- |
| Staff | goals on a project, each with a measure | the backlog hangs off what the project must achieve |
| Staff | to see, on the project, who outside staff can reach it, and add or remove them | access is explicit and reviewable |
| Staff | one list of support tasks waiting on us | nothing raised is lost |
| Staff | to resolve a support task with the words the raiser reads | the answer and the closing are one act |
| Staff | to mark a message internal | the team can think out loud on a client's task |
| Member (e.g. a client's product owner) | to find the goal something relates to, or create one | my ask lands in the right place |
| Member | to find the task something relates to, or raise a support task under a goal or beneath a task | I never raise the same thing twice |
| Member | to post on any goal or task I can reach | clarification happens where the work is |
| Anyone | to read everything said to me since I last looked, in one call | my Claude starts every session up to date |
| Administrator | to give a signed-up person access to exactly one project | a client's person works with us on their project and sees nothing else |

## The views

**Staff**

- `/projects/[projectId]` — gains a **Goals** panel (title, task count, completion bar,
  awaiting-answer count, status, Add goal) and, for administrators, a **Members** panel
  (name, email, add by email address, remove). The backlog is grouped by goal, in goal
  order, with tasks under no goal in an **Other tasks** section at the top; dragging a
  top-level task beside one under another goal moves it to that goal. The new-task modal
  gains goal and kind. Each backlog row shows a Support pill when the task is one.
  **Phases are gone from the UI** (2026-09-11, James: goals are the grouping level) — the
  `phases` table and `tasks.phase_id` stay in the database, unread, as sprints did.
- `/projects/[projectId]/goals/[goalId]` — new. The goal, its measure and status, the
  tasks under it, and its conversation. Edit and delete.
- `/projects/[projectId]/tasks/[taskId]` — the Comments section becomes the
  **Conversation**, with an *internal* checkbox on the composer. A support task shows who
  raised it, a **Resolve** form while it is open, and its resolution once closed. Status
  labels read as a support task's (Awaiting answer, Being looked at, Resolved).
- `/support` — replaces `/requests`: every open support task across every project, newest
  first, linking to the task page.
- `/clients/[clientId]` — the Requests section becomes Support: the support tasks on that
  client's projects.

**Members** work through the MCP server. `/portal` lists the projects they belong to and
links to Connect Claude; `/portal/requests/*` is gone.

## Site map

```
/projects ──▶ /projects/[projectId] ──┬──▶ /projects/[projectId]/goals/[goalId] ──▶ tasks/[taskId]
                                      └──▶ /projects/[projectId]/tasks/[taskId]
/support ──────────────────────────────────▶ /projects/[projectId]/tasks/[taskId]
/clients/[clientId] ───────────────────────▶ /projects/[projectId]/tasks/[taskId]
/portal  (members: their projects, Connect Claude)
```

## The entities

**Goal** — `project_id`, `title`, `measure`, `status` (`open`, `met`, `dropped`),
`priority`, `created_by`. Deleting one keeps its tasks (goal set null) and deletes its
conversation.

**Task** — gains `goal_id` (nullable), `kind` (`work` | `support`), `resolution`,
`resolved_at`. A support task closes only through `resolveSupportTask`; a plain status
change to done is refused while the resolution is empty.

**ConversationMessage** — exactly one of `goal_id` / `task_id`, `author_account_id`,
`body`, `is_internal`. Internal messages are never returned to members. The old
`task_comments` were copied in as internal messages; the Builder's own notes post here as
internal too.

**InboxCursor** — one row per account, `read_up_to`. `read_latest_messages` returns
messages after the cursor, from other people, on projects the caller can reach, and moves
the cursor.

**ProjectMember** — `project_id`, `account_id`, `added_by`. Administrators manage it.

**FeatureRequest** — retired. The migration turns every unpromoted request into a support
task on its project (declined ones arrive resolved with the decision note), marks every
promoted request's task as support, and copies each thread into the task's conversation.
The tables stay; nothing reads them.

## Access

Staff see everything through `is_project_manager()`. A member reads projects, goals,
tasks and non-internal messages where `is_project_member(project_id)`, and posts
non-internal messages there. The old "contacts read their own projects" policy (by
`client_id`) is dropped: a contact record says who someone is at a client; membership
says what they may reach.

On the MCP server the caller's standing is `staff`, `member` (with the ids of their
projects) or `none`; every shared action checks `canReachProject` before touching a
row. `account_directory()` and `account_by_email()` are security-definer functions so
staff and the service role can name members and message authors without opening
`profiles`.

## Commands and queries

| Command | Story it serves |
| --- | --- |
| `createGoal`, `updateGoal`, `updateGoalStatus`, `deleteGoal` | goals on a project |
| `createSupportTask` | raise something under a goal or beneath a task |
| `resolveSupportTask` | close it with the words the raiser reads; posts the resolution into the conversation |
| `postMessage` | say something on a goal or task, internal or not |
| `readInbox` | what has been said since I last looked, then move the cursor |
| `addProjectMember`, `removeProjectMember` | who may reach a project |

| Query | Story it serves |
| --- | --- |
| `findGoals`, `findTasks` | search before you create — word matches on title, measure, details and story |
| `getProjectGoals`, `getGoalSummaries`, `getGoal` | the goals panel and page |
| `getThread` | one conversation, with or without internal messages |
| `getOpenSupportTasks`, `getSupportTasksForClient` | `/support` and the client page |
| `getProjectMembers`, `getMemberProjects`, `getMemberProjectIds` | membership on both sides |

## The MCP actions

Shared by staff and members, each gated on the project: `find_goals`, `read_goal`,
`create_goal`, `find_tasks`, `read_task_conversation`, `create_support_task`,
`post_message`, `read_latest_messages`. Members also have `list_my_projects`. Staff add
`set_goal_status`, `resolve_support_task`, `list_open_support_tasks`; administrators add
`list_project_members`, `add_project_member`, `remove_project_member`. The request
actions are gone, as is `add_task_comment` (post_message replaces it).

The conversational shape — search first, show the match, ask before creating — is
doctrine in the `guidance` of each write action, read by the caller's Claude through
`describe_action`. It is not code: the server offers the searches and refuses nothing a
person has confirmed.

## Status

Built, on the working tree, not yet pushed. Migration 0051 is written and not yet applied:
it creates the tables, policies and functions above and performs the fold. `/requests`,
`/portal/requests`, the request components and `src/lib/server/requests/` are deleted;
`acceptAndBuild` and `defaultBuildBrief` go with them — the Builder now starts from the
task page's Send to build, as it already could.

Still to do, in order: apply 0051; add the first members (Jeremy on the Jewel Portal) from
the project page; notifications for staff when a member posts — today the bell knows
nothing of conversations, and `read_latest_messages` is how staff catch up too.
