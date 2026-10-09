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

> **8 October 2026, two tools beside the four.** A host draws a page for a tool, never for an
> action, so the upload box (below) is the one capability that could not be an action.
> `show_task_upload_box` shows it, and `perform_upload_box_step` is the door the box itself
> calls — marked for the box alone, so a host that draws boxes never offers it to the model.
> Everything else is still an action.

Every action runs against the service-role Supabase client, so row-level security is
not the gate here — the action code is. A member's projects come from `project_members`
at token resolution, never from input, and every shared action refuses a project that is
not among them.

## The route

```
src/routes/api/mcp/+server.ts               POST — the whole protocol surface
src/lib/server/mcp/readMcpRequest.ts        parse one JSON-RPC message
src/lib/server/mcp/mcpMethods.ts            initialize | ping | tools/list | tools/call | resources/list | resources/read
src/lib/server/mcp/mcpResources.ts          the pages a host draws, fetched by address
src/lib/server/mcp/mcpProtocol.ts           supported revisions and server identity
src/lib/server/mcp/mcpTools.ts              the four tools
src/lib/server/mcp/actionRegistry.ts        every action, filtered by standing
src/lib/server/mcp/actions/*.ts             one file per concern
src/lib/server/mcp/uploadBox/*.ts           the upload box: its two tools, its steps, its page
src/lib/uploadBox/*                         the box itself, as a browser runs it
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

Methods are looked up by their own names only (`methodNamed`). `methods['constructor']` used
to find the function every object inherits, which handed the caller straight back as the
result; only a loop inside the database client stopped that from being written out as JSON,
service key included.

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

This route needs the Claude's own network to reach the storage host, and a cloud session's
does not by default: seen on 1 and 5 October 2026, and checked again on 8 October, when both
`<project>.supabase.co` and yourbusiness.today were refused by the session's network policy.
Until the storage host is on the environment's allowed domains, the link works only from
somewhere with ordinary internet — the first completion on record was on 8 October 2026, with
the PUT sent from a browser — so the grant's answer now says what to do when the PUT is
refused: show the upload box.

## Files only the person holds: the upload box

A Claude can see an image pasted into a chat and still cannot pass it on: a tool call is text
the model writes, so the bytes would have to be typed out as base64, which is what damaged a
screenshot on 24 September 2026. Nothing in Claude carries a chat attachment to a connector by
reference. So the person hands the file over themselves, without leaving the conversation, and
without changing a setting: the file leaves from their own browser or phone, not from Claude's
sandbox, so the sandbox's network policy never comes into it.

`show_task_upload_box` (task) is an MCP App: its entry in `tools/list` names a page under
`ui://your-business-today/task-upload-box` in `_meta.ui.resourceUri`; a host that draws such
pages (Claude on the web, on desktop and on mobile) fetches it with `resources/read` and shows
it in a sandbox beside the tool's answer. A host that draws none (Claude Code) shows the answer
alone, which carries a link that does the same job.

A host may keep a page it has fetched, by address. So the page's address ends in a mark of its
own content (such as `…/task-upload-box/513193e0`), and a changed box is a new address the
host has not seen. Every address under the page's home still finds the page as it is now, the
bare home included, so a tool list or a conversation that names an earlier one keeps working.

The box (`src/lib/uploadBox/`) talks to its host in JSON-RPC over `postMessage`, with no SDK,
and takes files dropped anywhere on it, pasted, or chosen. For each file it tries, in order:

1. **Straight to storage.** `perform_upload_box_step` `grant` opens an ordinary upload grant,
   the browser PUTs the file to the signed link, and `record` turns it into the attachment:
   the same grant-then-record shape as everywhere else, full quality, up to 25 MB. The page
   asks the host for this one address in `_meta.ui.csp.connectDomains`.
2. **Through the connector.** A host may refuse that address — Claude was reported doing so
   (anthropics/claude-ai-mcp#40), and its maintainers have since said it honours the request;
   the box works either way. A refused request fails at once and is not tried again. A file
   up to 3 MB goes as base64 in an `attach` step instead: the box writes those bytes, not a
   model, so nothing is mistyped, and 3 MB is what fits under Vercel's 4.5 MB request cap.
3. **The upload page.** A bigger file is pointed at the link below, in words.

Every step is a call the host proxies to this server as the caller, so `reachableTask` gates
each one exactly as it gates an action. The steps answer in JSON, as structured content and
as their own text, because a program reads them. `open`, the first, hands the box the task's
title, the limits and a fresh link to the upload page each time the box is drawn, so a box
reopened in an old conversation still works.

The box trusts its host as little as it can:

- The way round is always on show. A host can leave the box unable to take a file without the
  box ever finding out — a phone's web view that opens no file chooser, say — so the link to
  the upload page is there from the moment its address is known, not only after a failure.
  It is opened through the host (`ui/open-link`), and spelled out to copy when the host will
  not open it.
- It waits two minutes for any answer and no longer, so a host that drops a request leaves a
  sentence on the file's row and the next file still goes.
- When a file lands it tells the host what arrived (`ui/update-model-context`) and offers one
  button that says so in the conversation (`ui/message`). Hosts do not reliably say whether
  they take messages, so the button is always offered, and says "Now tell Claude in a message"
  when the host refuses.
- It takes the host's theme, style variables and safe-area insets, and reports its height so
  nothing scrolls inside it.

The Paste image button (`boxClipboard.js`, `boxPasting.js`) is for an image that is on the
clipboard and not in a file. A browser lets an embedded page read the clipboard only when the
page around it grants that, and an MCP App can ask its host for clipboard writing but not for
reading. So the button tries the read, and where it is refused it asks for the paste keys
instead: they need no permission, and they reach the box because the press has just given it
focus — pressed with the cursor in Claude's own message field, they put the image in the
message. A phone has no paste keys, so there the button points at the upload page, which has
the same button and no host in the way: the browser asks the person directly.

The page is one self-contained document, because a host's sandbox loads nothing from anywhere
else: `uploadBoxDocument.ts` splices the stylesheet and the box's modules into the markup, and
takes the import and export lines off the modules as they join, since they share one script
there. So the modules import each other by name only, and declare each name once — both
checked by `uploadBoxDocument.test.ts`, with the 100-line limit the audit does not reach.

### The link

`/upload/<token>` takes files for one task, as one person, for thirty minutes, with no sign-in,
so it works on a phone and in any host. The link is written with the site's own address
(`companyDetails.websiteUrl`), which the host redirects to `www`, path and all. The token is
the task, the person and the expiry,
signed (`taskUploadLink.ts`, HMAC-SHA256 under a key drawn from the service key), so it needs
no table and no migration, and a rotated service key ends every outstanding link. On every
request `resolveUploadLinkHolder` checks the signature and the expiry, that the account still
stands, and that it can still reach the task's project. Each file is an ordinary upload grant
under that person, so the page reuses the site's own `uploadThroughSignedLink`. A link stops
starting uploads once fifty have been started on its task by its person since it was made
(`mostFilesThroughOneLink`) — counted from the grants themselves, whichever way they came, so
there is nothing to keep per link; a fresh link starts a fresh count. The link only ever adds
files to its own task; it reads nothing but the task's title, and the page sends no referrer,
so the token does not travel to storage with the file.

### What has been proved, and what has not

Proved on 8 October 2026 in a real browser (Chromium), with the box served by this server's
own `resources/read` — the dev server and the production build alike — and a stand-in for the
database and storage:

- inside the official host bridge (`AppBridge`) and the reference sandbox proxy from
  `modelcontextprotocol/ext-apps`, at both library generations (`ext-apps` 1.7.5 with
  `@modelcontextprotocol/sdk` 1.32.1, and 2.0.3 with `@modelcontextprotocol/client` 2.3.1):
  the handshake, the box's own tool listed for the app only, files chosen and dropped and
  compared byte for byte with what storage then held, a 25 MB file among them, and an image
  pasted from the clipboard;
- with the sandbox's policy refusing storage (`connect-src 'self'`): the fallback through the
  connector up to exactly 3 MB, and the pointer to the upload page one byte over;
- a host that refuses messages, links and context updates, one that carries no tool calls, and
  one that never answers;
- dark and light themes, a 320-pixel-wide screen, safe-area insets, teardown;
- the upload page end to end, on a desktop and a phone-sized screen, and every kind of link
  that must not work: expired, altered, signed with another key, for a task out of reach, for
  an account that is restricted or gone, and the fifty-first upload.

Proved the same day on the real storage, through the live connector: an upload grant taken with
`grant_task_upload`, one PUT from a browser — from inside a sandboxed page on a foreign origin,
which is how the box sends — and `record_task_upload`. The file arrived whole (47,754 bytes
sent, 47,754 read back with `read_task_attachment`) and is on this work's task. It is the
first upload grant on record to complete end to end: the earlier attempts the tasks describe
were stopped at the PUT by a sandbox's network. It is the shape the box's first rung and the
upload page both stand on, so what is left unknown about that rung is only whether the host
lets the request leave.

The paste button was proved the same way on 8 October 2026: inside the official host bridge
with the frame granted nothing, where the browser refuses the read by permissions policy and
the paste keys then put the image on the task; with a host that grants clipboard reading,
where one press does it; on a phone-sized touch screen; and on the upload page, with the
person allowing the read and refusing it.

The box inside Claude itself cannot be reached from a build session. Its owner tried it there
on 8 October 2026, after the deploy, and reported it working. Still unknown, each with its
fallback: which rung a file takes in Claude (storage directly, else rung 2, then 3), whether
Claude lets the box read the clipboard anywhere (else the paste keys, or the upload page), and
whether the mobile apps' web view opens a file chooser (else the link).

## Images waiting on a project — retired

Between 8 and 9 October 2026 a project carried a bank of images uploaded before their task
existed (`project_images`, migration `0065`), with `find_project_images`,
`read_project_image`, `assign_project_image` and `remove_project_image` to move them on to a
task. The upload box above made it unnecessary: a file goes on its task from the chat, so the
bank, its actions and the Images button on the project page were removed. The table stays
until a later migration drops it, so nothing already in a bank is lost.

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
