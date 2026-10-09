# Client Lifecycle — Architecture

> Superseded in part. Feature requests folded into support tasks on the project's own
> tree, and client access became explicit project membership — see
> [support-conversations-architecture.md](./support-conversations-architecture.md). The
> register, contacts, invites and project ownership below still stand.

How a stranger becomes a contact, a contact becomes a client, a client's products become
projects we run, and the things those clients ask for become tasks in the backlog.

Staff-only, like `/projects` and `/accounting`. This is the agency's own register of who we
work for — not the Prospector's directory, which is product data belonging to a customer
(see [prospector-architecture.md](./prospector-architecture.md)). Same vocabulary, different
tables, and they must not be conflated.

## What exists today

- `public.clients` — name, contact name, email, address, archived. Written by
  `src/lib/server/accounting/manageClients.ts`, read by every invoice. It is a billing
  address book, not a lifecycle.
- `public.projects` — name, description, archived, created by. Every project is already
  either an internal YBT product or a client's product; the database does not know which.
- `public.tasks` — already carries `is_user_story`, `story_role`, `story_want`,
  `story_benefit`. A feature request is a user story that arrived from outside.
- `public.profiles` — `is_staff`, `is_admin`. Everyone in the database today is us.
- Sign-in is Google and Microsoft only. The README claims email and password with
  verification; it does not exist. That claim is wrong and is corrected by this work.

There is no notion of a client's people, of which projects are theirs, or of anything they
want.

## The project is the system

A client says "the portal you build for us". We say "the Jewel Portal project". These are
one thing, and giving it two tables would mean two names, two owners, and the standing
possibility that a system says it belongs to one client while its project says another.

So there is no separate systems table. `public.projects` gains a nullable `client_id` —
null means an internal YBT product, set means that client's product — plus the repository
and environment links a client would recognise it by. "The systems we manage for Jewel
Enterprises" is then a query, not an entity, and a feature request that names a project has
already named its client, its backlog, and the project its task will land in. Nothing is
left to decide at promotion time.

## User stories

| As | I want | So that |
| --- | --- | --- |
| Staff | to record a company and the person I spoke to, before they buy anything | prospecting has somewhere to land |
| Staff | to move a company through lead → prospect → client → dormant | I can see the pipeline and who is actually paying |
| Staff | to mark a project as a client's, with its repository and live URL | I know whose product it is and where the code lives |
| Staff | to invite a client contact by email address | they can sign in and speak to us without going through my inbox |
| Staff | one queue of everything clients have asked for, newest first | requests are triaged rather than lost |
| Staff | to turn a request into a task on that project, with the client's words kept | the backlog carries the reason the work exists |
| Staff | to accept or decline a request with a sentence of why | the client is answered either way |
| Client contact | to raise a feature request against a project of ours | I can ask for work without writing an email |
| Client contact | to see the requests I have raised and where each one stands | I stop asking for status |
| Client contact | to reply in the thread on my own request | clarification happens once, in one place |
| Client contact | to sign in with an email address and a password | I do not need a Google or Microsoft account to reach the portal |

Everything below is demanded by exactly these stories. Nothing else appears.

## The views

**Staff**

- `/clients` — every company by stage, each row showing its stage, primary contact, project
  count and open request count. Add a company inline; the stage pill moves in place.
- `/clients/[clientId]` — the company: contacts (with an Invite button per contact), its
  projects, its requests, and the event ledger.
- `/projects` — unchanged, gaining a client column and a client filter. Internal products
  read as internal because the column is empty, not because of a badge.
- `/projects/[projectId]` — unchanged, gaining the client, repository and environment links
  in the header, and the requests raised against it beside the backlog.
- `/requests` — the triage queue across every client, newest first, filtered by status.
- `/requests/[requestId]` — the client's words verbatim, the thread, the accept/decline
  form, and the Promote to task button. The button has no project picker; the request
  already names one. Once promoted, the row links to the task.

**Client portal** — a client contact sees only this, and only their own company's data.

- `/portal` — their projects and their requests.
- `/portal/requests/new` — which project, what they want, why.
- `/portal/requests/[requestId]` — status and the thread.

The MCP server is the client's primary surface (see [mcp-architecture.md](./mcp-architecture.md)).
The portal exists because not every contact works through Claude, and because a story with
no view cannot be triaged.

## Site map

```
/clients ──▶ /clients/[clientId] ──┬──▶ /projects/[projectId]
                                   │              ▲
                                   └──────────────┼──────────┐
                                                  │          │
/requests ─────────────▶ /requests/[requestId] ───┴──▶ /projects/[projectId]/tasks/[taskId]

/account/sign-in ──▶ /portal ──┬──▶ /portal/requests/new
                               └──▶ /portal/requests/[requestId]
```

`/requests/[requestId]` is the hinge: it is the only place a client's words become our work.

## The entities

**Client** — `public.clients`, extended rather than replaced. Gains `lifecycle_stage`
(`lead`, `prospect`, `client`, `dormant`, `lost`), `website`, `owner_id` (the staff member
who owns the relationship), and keeps the billing columns invoices already read.

**ClientContact** — a person at a client: name, email, phone, role, `is_primary`,
`account_id` (null until invited), `invited_at`. The existing `clients.contact_name` and
`clients.email` are backfilled into the primary contact and dropped; `getClients.ts`,
`manageClients.ts`, `ClientFormFields.svelte`, `ClientRow.svelte` and
`InvoiceDocument.svelte` read the primary contact instead — invoices already join by
`client_id`, so nothing about billing changes. One person, one row: a contact's email must
not exist in two places.

**Project** — `public.projects`, extended. Gains `client_id` (null for internal YBT
products), `repository_url` and `environment_url`. No visibility flag: a project with a
client is visible to that client's contacts. If that ever proves too broad, it is one
column away, and today no story asks for it.

**FeatureRequest** — `project_id`, `raised_by_contact_id`, `title`, `body` (their words,
never edited by us), `status` (`new`, `accepted`, `declined`), `decision_note`, `task_id`
(null until promoted), `created_at`. No `client_id`: the project holds it, and storing it
twice is how the two disagree. Delivery is not a column either — a request is delivered
when its task is done, so it is read from the task.

**FeatureRequestComment** — `request_id`, `author_account_id`, `body`, `created_at`. Every
comment here is visible to the client; that is what the thread is for. Internal discussion
belongs on the task, which clients cannot see.

**ClientEvent** — the ledger: stage moved, contact invited, project assigned, request
raised, request decided, request promoted. Same idiom as `brain_events`.

## Access

Staff see everything through the existing `is_project_manager()` idiom. A client contact
reads projects whose `client_id` matches the client their `account_id` is linked to, and
the requests and comments hanging off those projects — and nothing else. Tasks, phases,
sprints, comments and the backlog stay staff-only: the contact policy is on `projects`,
`feature_requests` and `feature_request_comments`, and is never extended to `tasks`. A
signed-in account with no contact row is not a client and reaches nothing.

**Inviting a contact.** Staff press Invite on a contact. We create the auth user for that
email address, link `account_id`, and Supabase sends a set-your-password email. The contact
follows the link, sets a password, and lands on `/portal`. The same email-and-password path
serves staff, so `/account/sign-in` gains an email field, a password field, and a Forgot
password link alongside the Google button.

**Microsoft sign-in is removed** — the button, `beginMicrosoftSignIn.ts`, its action, and
`docs/microsoft-login-setup.md`. Existing Microsoft accounts keep their rows; they sign in
by setting a password on the same address.

## Commands and queries

| Command | Story it serves |
| --- | --- |
| `createClient` | record a company |
| `moveClientStage` | move it through the pipeline |
| `addClientContact` | record a person |
| `inviteClientContact` | give that person a way in |
| `assignProjectToClient` | say whose product this is, and where its code lives |
| `raiseFeatureRequest` | a client asks for something |
| `commentOnFeatureRequest` | either side clarifies |
| `decideFeatureRequest` | accept or decline, with a reason |
| `promoteFeatureRequestToTask` | the request becomes work |

| Query | Story it serves |
| --- | --- |
| `listClients` | the pipeline |
| `getClient` | one company and everything hanging off it |
| `getTriageQueue` | everything clients have asked for |
| `getFeatureRequest` | one request and its thread |
| `getProjectRequests` | what a project's client has asked for |
| `getContactPortal` | a contact's own projects and requests |

Each entry point runs its gates first — signed in, staff or the contact who owns the row,
input valid — before any domain logic. `raiseFeatureRequest` refuses a project whose
`client_id` is not the caller's, and refuses an internal project outright. 
`promoteFeatureRequestToTask` calls the existing `createTask` on the request's own project
with `is_user_story` true and the story fields filled from the request: role from the
contact, want from the title, benefit from their stated reason. The task and the request
then reference each other; neither copy of the wording drifts, because the task's `details`
links back rather than restating.

## Status

Steps 1 and 3 to 6 are built and on `main`'s working tree; migrations 0034 and 0035 are
applied to the live database. Step 2 — pointing the twenty-two existing projects at the
clients that own them — is a hand backfill nobody has done yet, so every project still reads
as internal. The MCP server ([mcp-architecture.md](./mcp-architecture.md)) is not built.

## Build order

1. Migration: extend `clients` and `projects`, add `client_contacts`, backfill the primary
   contact, add `feature_requests`, `feature_request_comments`, `client_events`, and the
   policies. Accounting reads move to the primary contact in the same change.
2. Backfill the client on existing projects by hand — the Jewel ones to Jewel Enterprises,
   the rest left internal. A dozen rows, no script.
3. Email-and-password sign-in and the invite flow; remove Microsoft.
4. Staff views: `/clients`, `/clients/[clientId]`, `/requests`, `/requests/[requestId]`,
   the project header and the `/projects` client column, including promotion to task.
5. The MCP server, which is only a second face on the commands step 4 already built.
6. `/portal`, last — by then every command it needs exists.

## Deliberately not built

A project has one `environment_url`. Jewel Portal and its Azure test instance are two
environments of one product, and if naming them separately ever matters, that is a small
child table demanded by a story about environments — not a guess made now.
