# The MCP Server — Architecture

One endpoint, `/api/mcp`, that lets a person's own Claude do what they could do on the
site — without a browser, an email, or a login prompt in the middle of their work. Who
they are decides what that is: staff work on the business; a project member reaches only
the projects an administrator has added them to — their goals, tasks and conversations
(see [support-conversations-architecture.md](./support-conversations-architecture.md)).

> **15 September 2026.** The caller model below describes the staff-and-client shape. Since
> the owner-and-team change (`migrations/0052_owner_and_team.sql`), a caller is an account
> holder resolved from an OAuth token only: they own some projects and are a member of
> others, and every project, goal, task and conversation action is gated by that standing
> on the project in question — owners manage, everyone on the project works. `is_staff`
> still gates the clients register. Client access tokens and `/portal`
> are gone; a client contact is an ordinary member. The stories and shape below still hold;
> read "project member" as "anyone on the project" and "staff" as "the owner" where the
> action manages the project.

It adds no domain. Every action here is a second face on a command or query the site
already runs. If an action needs something the site does not define, the domain is wrong —
fix it there, not here.

> **15 September 2026, the working doctrine.** `get_current_context` now ends with the working
> doctrine every connected Claude follows (`src/lib/server/mcp/workingDoctrine.ts`): read the
> inbox first, find the task before touching anything, leave a work-log message when the work
> stops, put questions for other members on the task, never raise a refactor round by hand. The
> same doctrine is in the `guidance` of the actions it names, and `workingDoctrine.test.ts` fails
> the build if either names an action that does not exist. See
> [refactor-cadence-architecture.md](./refactor-cadence-architecture.md).

> **29 September 2026, raising something.** After the working doctrine, `get_current_context`
> carries the raising doctrine (`src/lib/server/mcp/raisingDoctrine.ts`): the walk a client's
> Claude takes from "here is what I want" to a well-formed goal, task or support request. Find
> the project and the goal, show what already covers it, decide with the person what it is,
> write it in that shape in their own words, ask before creating, put their files on it, and
> say what happens next. It lives in the connector because a client's Claude has nothing else:
> a skill in a repository never reaches it. The same test guards its action names.

## The stories it serves

| As | I want | So that |
| --- | --- | --- |
| Project member | to find the goal and task something relates to, or raise a support task, from inside Claude | the ask lands in the right place while I still remember the detail |
| Project member | to post on a goal or task and read everything said to me since I last looked | clarification costs one message, not one WhatsApp relay |
| Project member | to see which projects I can reach | I aim at the right one |
| Staff | to triage requests, run projects and tasks, and keep the books from Claude | the admin happens where the thinking happens |
| Anyone | to press Connect in Claude and arrive as myself | there is no token to copy and nothing to paste |

## The shape: four tools, many actions

Claude sees four tools, the same four for everyone:

| Tool | What it does |
| --- | --- |
| `get_current_context` | who the signed-in person is, their standing, and the areas they can reach |
| `list_actions` | every action this person may run, one line each, optionally narrowed to an area |
| `describe_action` | one action in full — its input schema and any doctrine attached to it |
| `perform_action` | run one action by name with its input |

The actions live in `src/lib/server/mcp/actions/`, one file per concern, gathered by area
(`account`, `clients`, `projects`, `goals`, `support`, `conversations`, `tasks`,
`accounting`) into `actionRegistry.ts`. Each action names its audience — `everyone`,
`member`, `staff` or `admin` — and the registry filters by the caller's standing on every
lookup, so a member cannot list, describe or run a staff action; it does not exist for
them. An `everyone` action that touches a project checks `canReachProject` itself.
Accounting is `admin`, matching the site.

This shape keeps the tool list small and stable while the site grows: adding a capability
is adding an action file, never a tool. Tool descriptions are prose the caller's Claude
reads, so they name the domain plainly.

Every action runs against the service-role Supabase client, so row-level security is
not the gate here — the action code is. A member's projects come from `project_members`
at token resolution, never from input, and every shared action refuses a project that is
not among them.

## The route

```
src/routes/api/mcp/+server.ts               POST — the whole protocol surface
src/lib/server/mcp/readMcpRequest.ts        parse one JSON-RPC message
src/lib/server/mcp/mcpMethods.ts            initialize | ping | tools/list | tools/call
src/lib/server/mcp/mcpProtocol.ts           supported revisions and server identity
src/lib/server/mcp/mcpTools.ts              the four tools
src/lib/server/mcp/actionRegistry.ts        every action, filtered by standing
src/lib/server/mcp/actions/*.ts             one file per concern
src/lib/server/mcp/resolveMcpCaller.ts      the gate
src/lib/server/mcp/toolFailureSentence.ts   database failures as sentences the model can act on
src/lib/server/mcp/requestLimits.ts         the body cap and the daily ceiling
src/lib/server/mcp/mcpErrors.ts             JSON-RPC error codes as named constants
```

Streamable HTTP, JSON responses only — no SSE, no session id, no server-initiated
messages. Nothing here streams or pushes, so the stateless shape is the honest one and it
survives Vercel's serverless model without a session store. Each POST carries one
JSON-RPC message and gets one JSON reply; a notification gets 202 and no body.

A failure inside an action is answered as a tool result with `isError`, in a sentence:
a malformed id says so, a missing referent says so, and only a real fault says "try
again shortly" — a refusal the model can read beats an error it will retry.

## Authentication

Two ways in, both resolved by `resolveMcpCaller`:

**OAuth 2.1** — the way Claude's own connectors work. The server publishes
`/.well-known/oauth-authorization-server` and `/.well-known/oauth-protected-resource/api/mcp`;
an unauthenticated call gets 401 with a `WWW-Authenticate` header pointing at them.
Clients register themselves at `/oauth/register` (RFC 7591), send the person to
`/oauth/authorize` where they sign in as usual and press Connect, and exchange the code at
`/oauth/token` with PKCE (S256, required). Access tokens (`ybt_at_`, one hour) and refresh
tokens (`ybt_rt_`, sixty days) are opaque and SHA-256 hashed at rest, like every secret in
this database. A confidential client's secret is verified at the token endpoint; a public
client is bound by PKCE alone. Codes are single-use by construction — claiming one is a
single conditional update. Only staff and client contacts can approve a connection; an
account that is neither is told so on the authorize page rather than handed a token that
would never work.

The token endpoint is called server-to-server with no `Origin` header, which SvelteKit's
own form-origin check would refuse. That check is therefore off in `svelte.config.js` and
re-implemented in `hooks.server.ts` through `src/lib/server/http/crossSiteFormSubmission.ts`,
which exempts exactly that one path and keeps every other form as protected as it was.

**Client access token** — `ybt_` prefix, minted at `/portal/access` by a client contact
themselves, for MCP clients that take a bearer header and nothing else. It resolves to
the contact's account and from there to their memberships, so it reaches exactly what
signing in would, and a restricted account's token stops working the day the account is
restricted.

Tables: `client_api_tokens` (0036), `oauth_clients`, `oauth_authorization_codes`,
`oauth_tokens` (0038).

## Files from a Claude's own workspace

`attach_file_to_task` takes a public address or base64, and base64 typed out by a model is
slow and corrupts bytes. A file that lives in the caller's Claude's workspace — a screenshot,
an export — goes through a one-time upload link instead, the same grant-then-record shape the
site's own attachment form uses (`grantAttachment` and `recordAttachment` in
`attachmentActions.ts`), with the storage bucket carrying the bytes so Vercel's 4.5 MB body
cap never sees them:

1. `grant_task_upload` (task, filename, mimeType) writes a `task_upload_grants` row under the
   caller (migration `0062`), signs a storage upload link for the attachment's own path, and
   answers with the `curl --upload-file` command and the `uploadId`. The link expires fifteen
   minutes after it is granted (`uploadLinkLifetimeSeconds`).
2. The caller's Claude sends one HTTP PUT of the raw bytes, up to the bucket's 25 MB.
3. `record_task_upload` (task, uploadId) finds the grant by id, task and caller, reads the
   size that actually landed from storage, claims the grant with a single conditional update
   (`recorded_at` null and not expired, so it is used once), and writes the
   `task_attachments` row under the person the link was granted to. An expired grant's stray
   file is removed; a missing file says so, so the PUT can be retried.

The storage link itself refuses a second file at the same path, and the grant refuses a
second recording, so the link works once. A grant nobody records leaves no attachment; a
file it left in storage is dropped with the task.

## Images waiting on a project

A Claude in a chat cannot pass an image the person pasted there on to the connector, so the
person uploads it to the project page instead — the Images button in the project header opens
the project's bank of unassigned images. The upload is the same grant-then-record shape as a
task attachment (`grantImage` and `recordImage` in `imageActions.ts`), into the same
`task-attachments` bucket at `projects/<project id>/images/<image id>/<file>`, recorded in
`project_images` (migration `0065`). Only images are taken, up to 25 MB.

1. `find_project_images` (project, optional words from the file name) lists the bank newest
   first, with how long ago each was uploaded and by whom, since the task it belongs to is
   usually raised a few minutes later.
2. `read_project_image` (project, image) returns the image itself, so the Claude can tell
   which one is which.
3. `assign_project_image` (task, image) calls the `assign_project_image` database function:
   one transaction that writes the `task_attachments` row under the same id, path and uploader
   and deletes the `project_images` row. The file never moves. The task must be on the image's
   project. The project page's modal assigns by hand through the same function.
4. `remove_project_image` (project, image) deletes the file and the row, as the modal's ✕ does.

## Abuse and limits

The caller's Claude is an eager agent. Two limits, both named constants: a body cap on a
message or a raised support task (`longestMessageBody`), so a runaway agent cannot paste
a repository into `want`; and a per-account daily ceiling on raising support tasks
(`dailyRaiseCeiling`), above which the action returns a plain refusal rather than an
error. Duplicates are avoided by doctrine rather than code: every write action's guidance
says search first and post on the match.

## Status

Built and deployed. Proved against production: the discovery documents answer, an
unauthenticated call gets 401 with the right header, GET gets 405, registration
validates its input. Proved locally against the production build: the token endpoint
accepts a form-encoded POST with no `Origin`, other forms without one are still refused,
malformed bodies get an OAuth error rather than a crash. Migrations 0036 to 0039 are
applied.

Proved end to end against production on 5 September 2026: register (`client_secret_basic`),
sign in, approve, exchange, replay refused, refresh with rotation, wrong secret refused,
`initialize`, `ping`, `tools/list`, then `get_current_context`, `list_projects`,
`read_task_queue`, `list_clients`, `list_triage_queue` and `read_accounting_overview` as an
administrator. Migration 0039 lets `staff_directory()` answer the service role, which the
MCP runs on; without it every action that reads the directory failed.

## Known gaps, in order

- `/oauth/register` is unauthenticated and unrated; anyone can fill `oauth_clients`. Cap it
  per IP or gate it behind an initial access token before the URL is public.
- There is no page where a person sees and revokes their connections; the row-level
  policies in 0038 are ready for one.
- Actions do not validate their input against `inputSchema` before running; a bad id is
  caught by the database and reported honestly, but a read-and-refuse in the action would
  read better. `create_task` in particular accepts a phase or parent from another project.
- Input for `create_invoice`/`add_invoice_line` accepts zero and negative quantities.
