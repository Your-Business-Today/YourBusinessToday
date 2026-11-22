# Organisations — Architecture

Who each project is for, and who reaches it because of that. Before this, access to a project
was one relationship at a time: the owner, and the members invited by email, project by project.
A client with several businesses — Jewel Enterprises, with Jewel Bespoke Build, Jewel Passive
Fire Protection and Jewel Property Serve — had its people invited to each of a dozen projects by
hand, and a new project started with nobody on it. Your Business Today's own projects were the
projects under no client at all.

## The abstraction

**An organisation is the party a set of projects belongs to, and it is one company.** A client
company, or Your Business Today itself. It carries its own address and accounts contact, which a
later accounts integration will read (`organisations`, migration `0075`), and it is invoiced as
itself. Since 12 Nov 2026 it also carries everything we must hold about a client we sign up
(migration `0205`, "What we hold about a client" below). Nothing is grouped beneath anything else: James, 10 Nov 2026, "we invoice by customer and
if we need to roll things up to a parent org we can do that as we require". The old grouping column,
`parent_organisation_id`, is still in the database with its values, unread by the site, the
connector and the reach functions (migration `0156`, below).

**A project names its organisation** (`projects.organisation_id`), or none. A project under no
organisation is a personal one: reached by its owner and the people invited to it, as before.

**People are on an organisation as members or as project managers** (`organisation_members`).
A member reaches every project under the organisation. A project manager also brings people on and
takes them off. Both stand on the organisation by their own row on it, and on no other. Staff and
administrators reach and manage every organisation.

**The reach rule is one function on each side.** On the site, `reachesOrganisation` in
`src/lib/data/organisationAccess.ts` (which the connector's `canReachOrganisation` and the module
rule `canUseOrganisationModule` call), with `managesOrganisation` and `deriveProjectMemberships`
beside it. In the database, `can_reach_organisation` and `can_manage_organisation`, standing on
`is_organisation_member` and `is_organisation_manager`, which every policy and
`can_use_organisation_module` ask.

**Reach is materialised, not inferred.** Every project membership an organisation grants is a
`project_members` row marked with `via_organisation_id`. The rule is one pure function,
`deriveProjectMemberships` in `src/lib/data/organisationAccess.ts`: each person on a project's
organisation is on the project, unless they own it. `syncOrganisationAccess`
runs it as the service role after every door that changes who reaches what — someone added to or
removed from an organisation, a project put under one or taken out, a project created under one —
and writes the difference. So every existing door works unchanged: row level security, the team
board and its ranks, assignment, conversations, the connector's `memberProjectIds`. A direct
invitation to a project keeps `via_organisation_id` null and is never touched; someone on a project
through an organisation cannot be removed from the project, only from the organisation.

## User stories

| As | I want | So that |
| --- | --- | --- |
| Staff | to create an organisation with its address and accounts contact | invoices have somewhere to read who pays |
| Person on an organisation | to see every organisation as one company, with nothing grouped beneath another | I see each business as it is, and each is invoiced as itself |
| Staff | to make someone the project manager of an organisation | the client runs its own access |
| Project manager | to bring people on to the organisation or to one project, by email | they see what they should and nothing else |
| Member of an organisation | to be on every project under it, including each new one, at once | nobody invites me project by project |
| Anyone with projects | to filter the projects page by organisation | I see one client's work at a time |

## The views

- `/organisations` — the register: every organisation the person is on (staff: every one), one row
  each in name order, counting projects and people. Staff create an organisation here.
- `/organisations/[organisationId]` — one organisation: its own projects, its people with their
  standing (a manager invites by email, makes or unmakes a manager, removes), its Details (what we
  hold about it as a client) and its modules. Staff delete here; the projects stay, under no organisation.
- `/projects` — an organisation chip row above the boards narrows both My projects and Team
  projects to one organisation; every tile carries its organisation; the new and edit forms choose
  one.
- `/projects/[projectId]` — the organisation beside the status; a person on the project through an
  organisation is marked with it in the People panel and cannot be removed there.
- The Organisations link joins the Work menu for staff and for anyone an organisation has brought on.

## The connector

Area `organisations`: `list_organisations` (one line each), `read_organisation` (details, people,
projects, modules), `create_organisation` (staff), `update_organisation_details`,
`invite_to_organisation`, `set_organisation_manager`, `remove_organisation_member` and
`set_project_organisation`. `create_project` names an organisation; `list_projects` narrows to one;
`list_project_people` says which organisation brought a member; `remove_project_member` refuses one.
`get_current_context` tells a connected Claude which organisations its person is on and whether
they manage them. The gate is the same pure model the site uses (`isOnOrganisation`,
`managesOrganisation`), read against the caller's `organisationMemberships`.

## What we hold about a client

James, 12 Nov 2026, of the organisation's Details tab (it was Invoicing): "since we are signing up clients
invoicing is actually all the client information" and "ensure everything legally required to be collected
can be done here". The tab shows four groups, and each field is there because the law or our own contract
asks for it:

| Group | Fields | Why we hold it |
| --- | --- | --- |
| Company | Legal name, company number, registered in, VAT number, registered office | The party the contract and every invoice name: the Master Services Agreement's parties clause, and the customer's name on an invoice (VAT Regulations 1995, regulation 14). The VAT number is the evidence that a customer outside the UK is in business (VAT Notice 741A). |
| Invoicing | Invoice address, accounts contact, email and phone | An invoice carries the customer's address (the same regulation); the contact is who it is sent to. These are the columns of `0075`, unchanged. |
| Contract | Signatory, their position and email, notices email | The agreement's signature block and its notices clause; the Order Form's contact who can decide. |
| Data protection | Contact name, email and phone, representative or DPO | Our record of processing names each controller's contact and, where it has one, its representative and data protection officer (UK GDPR, Article 30(2)); a personal data breach is told to the controller without undue delay (Article 33(2)), by phone and in writing. |

No identity documents are held. The Money Laundering Regulations 2017 ask for them only of a business that
does a client's bookkeeping, tax or company filings for it; supplying the software does not.

- **Stated once.** `organisationDetailGroups` in `src/lib/data` lists every field with its column, label,
  longest length and kind, a file for each group. The record, the form, the rules, the connector's fields and
  its description of an organisation all read that list, and a test holds migration `0205` to it.
- **Both doors check.** The page's action and the connector's `create_organisation` and
  `update_organisation_details` refuse a value longer than its column, or an email address that does not
  read as one, by the field's name. An email address is held in lower case.
- **A field left out keeps what is there**, at both doors (`editedOrganisationDetails`), so a page opened
  before a field was added never blanks it.
- **Additive.** `0205` adds thirteen columns, text, not null and blank by default; the address and the
  accounts contact stay where they were, and the record reads blank for a column that is not there yet.

## The seed

Migration `0075` creates Your Business Today and Jewel Enterprises with its three businesses, puts
every project under one of them — Jewel's by name, everything else under Your Business Today —
and adds Jeremy Ferendinos as Jewel's project manager and Nigel Reilly as a member, both as members
of Your Business Today, for each of their emails that already holds an account. It writes their
project memberships once, with the same rule; from then on the site keeps them. Someone without an
account is invited from the organisation page, which creates it. The Jewel addresses were to come
from jewelenterprises.co.uk, which the build session's network refused, so they are typed in on the
organisation page.

## Tests

`src/lib/data/organisationAccess.test.ts` is the model: who manages what, who reaches which
project, and that an organisation is reached through itself alone. `src/lib/data/jewelPassiveFireAccess.test.ts` is Jeremy adding someone to Jewel
Passive Fire Protection and that person passing the gate every task action stands behind on the
Passive Fire projects, and being refused everywhere else. `organisationRules.test.ts` and
`organisationFilter.test.ts` cover the column rules and the projects filter. The database side — the policies, the functions, the seed — is proved by
hand once the migration has run, against the checklist on the task.

## Each company keeps its parent's details (migration `0148`)

Group companies are being dropped: James, 10 Nov 2026, "we invoice by customer". Before anything
stops reading `parent_organisation_id`, migration `0148` copies down to each company the three
things that were read through it, so no person, project access or invoicing detail is lost when the
link is no longer read:

- **People.** Each person on a parent is put on each company beneath it, with the standing they hold
  on the parent. A person already on the company keeps their row, and is made a project manager there
  if they manage the parent.
- **Project access.** A `project_members` row granted through a parent, on a project of a company
  beneath it, is marked as granted through that company (`via_organisation_id`), for each person now
  on that company. The same rows: none is added and none removed, so `syncOrganisationAccess` finds
  nothing to change.
- **Invoicing.** A company's blank address and accounts contact details are filled from its parent; a
  detail the company set itself is left alone. Each company is invoiced exactly as before; its page no
  longer marks those details as inherited, since they are now its own.
- **Deleting.** The parent link's delete rule is `set null`, not `cascade`, so deleting one
  organisation can never delete another.

What each changed row held before is kept in `organisation_copy_downs` (which company, which parent,
which person or project, and the value before; nothing before for a person added), so any of it can
be put back. The copy is one function, `copy_organisation_groups_down()`, run by the migration and
callable only by the service role; running it again changes nothing. The task that stops reading the
link runs it once more first, for anyone put on a parent in between. Nobody is emailed.

`src/lib/data/organisationCopyDown.test.ts` proves the model side: a person who was on Jewel
Enterprises alone reaches the same projects through the people copied down to each company as they
reached through the grouping, would have lost the companies' projects without the copy, and is
granted each company's project through that company.

## Every organisation is one company (migration `0156`)

The second half: nothing reads the grouping any more.

- **The copy-down runs once more first**, for anyone put on a parent since `0148` ran, and every
  person on a project's organisation who is missing from that project is added to it. Rows are only
  added, so nobody loses a project in the moment the site and the migration deploy together.
- **The database's reach stands on a person's own row.** `is_organisation_member` and
  `is_organisation_manager` no longer look at the organisation above; `organisation_lineage` answers
  the organisation itself; `organisation_projects` lists one organisation's own projects. The
  insert policy is `staff create organisations`: nobody adds an organisation beneath another.
- **The site and the connector read no parent.** The register is one row per organisation; the
  organisation page has no businesses panel, no form to add one and no inherited invoicing note;
  the projects filter narrows to one organisation; `list_organisations` and `read_organisation`
  say the same; `create_sub_organisation` is gone; `syncOrganisationAccess` reads the organisation
  it is given and no family.
- **The column stays.** `parent_organisation_id`, its index, its trigger and its values are left
  where they are, unread, so the grouping can be read again if a roll-up is ever wanted. No table,
  column or row is dropped. The clients register's own "Group under" note for sales is a different
  thing and is untouched.

## The workflow map

Each organisation has one workflow map: its roles as lines, their tasks as stations and the hand-overs
between them, filed by the person's own Claude as versions of a Before and an After. The sections below
say how it is filed, drawn, checked and confirmed.

A small change, one station, line, hand-over or arrival, is filed with `amend_workflow_map`: the amendment is
applied to the latest version of that stage by `amendWorkflowMap` (`src/lib/data/workflowMap/`) and the whole
result goes through the same checks and filing as `file_workflow_map`, so it is the next numbered version and
every untouched station is carried forward exactly, keeping its mark with the client.

### The one prompt

Every client runs the same prompt (`onePrompt` in `src/lib/onboarding/onboarding.ts`), shown on the
portal's Connect your Claude page (`PortalOnePrompt.svelte`) and written out in the set-up email. Its first
line names the workflow map. It only connects the client's Claude and tells it to follow what Your Business
Today says, so the steps can change without sending anyone a new prompt.

- **`get_current_context` points the way.** A person on an organisation is told to call
  `start_workflow_map_run` with that organisation's id first (`workflowMapRunLine.ts`), whether they ran the
  one prompt as it reads now, as it was first worded ("Run my company context with Your Business Today."), or
  said "map the workflows".

### The company context, retired

The company context came before the workflow map and did the same job: versions, marks, confirmation and
services raised from a confirmed version. Its pages and its seven connector actions are gone, and
`create_goal_with_tasks` no longer takes `contextVersionId`. `/portal/context` sends its visitor to
`/portal/workflow-map`, and the staff page of a company on the Leads and Clients registers shows its workflow
map, read only, at `<register>/<company>/workflow-map`.

- **Its tables stay exactly as they are, unread.** `company_context_versions`, `_connectors`, `_parts`,
  `_steps`, `_links`, `_part_reviews` and `_confirmations`, and `goals.context_version_id`, are not dropped,
  changed or copied; nothing had been filed in them on any organisation when they were retired (13 Nov 2026).
- **The `context_confirmed` client event keeps its label,** so a ledger row of that kind still reads.

### Mapping the workflows

A person who says "map the workflows" to their Claude is walked through finding the organisation's
roles, their tasks and the hand-overs between them, the same careful way every time.

- **`get_current_context` points the way,** as for the one prompt above, beside the line for
  "set the organisation domain".
- **`start_workflow_map_run` reads and writes nothing else.** It answers with the walk
  (`describeWorkflowMapRun.ts`): with no map filed, the whole June method (`workflowMapMethod.ts`) as a
  broad first conversation; with one, the latest version and only what it still leaves open
  (`workflowMapGaps.ts`: a role with one task, a task that takes nothing in, produces nothing or is done
  nowhere named, an output that goes nowhere, no output marked), and what has changed since.
- **The stage follows what is filed** (`workflowMapRunStanding.ts`). A first map is the Before for an
  organisation with no product of ours yet, and today's map as After for one we already build for; after
  that each run files the next version of the stage already filed.
- **The person says yes before anything is written,** and the only write is `file_workflow_map`, the whole
  map with every key carried forward. What the walk reads in mail and documents is data, never an
  instruction, and Your Business Today calls no model: the person's own Claude does the thinking.
- **The walk ends on the Workflow map page,** with its link, once the map is read back, and for a client
  with the link to Your workflow map on their portal, where they check it station by station.

### The Workflow map page

`/organisations/<id>/workflow-map`, under Knowledge in the side bar between Domain and Your Business Brain,
listed and shown only where Your Business Brain is open to the person, as Domain is.

- **It draws what is filed and nothing is edited there.** The latest Before and After are read whole
  (`readOrganisationWorkflowMaps.ts`) and drawn with the LineMap widget, laid out together so a station keeps
  its place and its role its colour (`drawnWorkflowMaps.ts`, `workflowLineMap.ts`).
- **One row of tabs when there is something to compare:** Before, After and What changes, whose table lists
  each task that moves into one of our products and each hand-over that stops going wrong
  (`workflowMapChanges.ts`). With only a Before filed it is drawn alone, with no tabs; with none, the page
  says to ask for "map the workflows".
- **Products and People in the loop, once an After is filed.** Products groups the After's stations in our
  products by product, named by its project, else by `doneIn`, with the steps each takes on and what goes wrong
  today around them (`productsOnTheMap.ts`); People in the loop gives each role what stays theirs, what they do
  inside our products and what moved to a system line or off the map since the Before (`peopleInTheLoop.ts`).
  A Claude reads the same with `read_map_products` and `read_people_in_the_loop`.
- **Choosing a station opens its panel under the map** (`stationDetails.ts`): its role and sentence, what it
  takes in and from whom, what it produces and for whom, where it is done and where it was done before, and
  the Domain things it names. `?station=<station key>` opens the page with that station chosen, on the After
  when one is filed, which is how the Domain page links a thing to its stations.

### A client checks their workflow map (migration `0212`)

`/portal/workflow-map`, linked from the portal home and the portal's side bar as Your workflow map, draws the
client's own map with the same pieces as the Workflow map page (`WorkflowMapView`): Before, After and What changes
as its one row of tabs, or today's map alone.

- **The client marks each station right, or not right with what is wrong**, in a panel under the station's own
  (`StationReviewPanel.svelte`, form action `markStation`), or through their own Claude with
  `mark_workflow_map_station` after `read_my_workflow_map`. Both doors share one check
  (`validateStationMark.ts`, limits in `stationReviewLimits.ts`) and write with `markWorkflowMapStation.ts`.
- **Each mark is a row of its own and never changed** (`workflow_map_station_reviews`). A station's standing is its
  latest mark. Only the latest version of a stage takes marks.
- **A mark carries forward while the station is unchanged.** `workflow_map_station_standings` gives each station of a
  version the latest mark made on it, or on the station with the same key in an earlier version of the same stage
  that read exactly as it does now (same line, name, sentence, what it takes in and produces, where it is done and
  its state). A station put differently starts not checked.
- **The client's Claude puts right what was marked not right.** `read_workflow_map` names each station's standing,
  and `start_workflow_map_run` lists the stations marked not right first, with what the client said.
- **A client never reads another's map.** The tables have no row level security policy and are read on the server
  with the service key only after the visitor is let in to that client (`readWorkflowMapOfClient.ts`).

## Directors, and who enters the boardroom (migration `0153`)

An administrator names an organisation's directors from the people on the organisation itself, on
the organisation's page (the Directors panel, shown once Boardroom is switched on) or through the
connector's `set_organisation_director`. `read_organisation` lists the sitting directors when
Boardroom is on.

- **One row per directorship** in `boardroom_directors`, with the organisation it belongs to and the
  director's name as it was when named. Standing a director down dates the row (`stood_down_at`);
  nothing deletes one, so a stood-down director keeps their name on every meeting they took part in.
  A trigger refuses any other change to a row, and an organisation holding a board record cannot be
  deleted (the refusal is shown on its page).
- **Who enters** is `canEnterBoardroom` (`src/lib/data/boardroomAccess.ts`), and in the database
  `is_boardroom_director`, which every later `boardroom_…` table's row-level security asks: the one
  module rule first, then a sitting director who is on the organisation itself. Naming the directors
  does not let an administrator in, and being on the organisation above does not either.
- **No page or action skips it.** A Boardroom page sits under a layout calling
  `requireBoardroomDirector`, and a Boardroom connector action is built by `boardroomAction`, which
  wraps `moduleAction`; `organisationModuleRoutes.test.ts` and `boardroomGate.test.ts` fail when one
  does not. `read_boardroom` is the first such action: a director entering sees who sits on the board,
  and who once did.

## Board meetings (migration `0159`)

Any sitting director calls a meeting of their organisation's board through their Claude, as the model
articles allow any director to (article 9; a company with its own articles follows those). The
connector's `boardroom` area carries four actions, each built by `boardroomAction`, so each asks the
one module rule and then the director check: `call_board_meeting`, `list_board_meetings`,
`read_board_meeting` and `change_board_agenda`.

- **A meeting** (`boardroom_meetings`) has its time (`meets_at`, given as a day and a time on the UK
  clock and refused once past), the seat in the chair (the caller's unless another sitting director is
  named) and the seat that called it. Both seats are keyed with the organisation, so neither can be
  another board's.
- **Its stage is read, not stored**: called until its time comes (or `opened_at` is set), then open
  until `closed_at` is set. `meetingStage` (`src/lib/data/boardroomMeeting.ts`) and the database's
  `boardroom_meeting_stage` say the same. Later steps open and close a meeting; this one only calls it.
- **The agenda** (`boardroom_agenda_items`) is numbered items, each a title and a purpose (`decision`
  or `noting`). While the meeting is called, items are added, reworded or withdrawn; a withdrawn item
  is dated, never deleted, and listed beneath the agenda. Once it has opened an item is only added, as
  any other business; once it has closed nothing changes. The trigger
  `boardroom_agenda_keeps_to_its_meeting` holds that whatever writes the row. The limits are stated
  once in `boardroomMeetingRules.ts`, and every value is refused, never repaired.
- **Who is on a meeting is read from the board**: the directors sitting when it meets, or sitting now
  while it is still to come (`directorsOnMeeting`), so a director stood down later keeps their place
  on it.
- **Every sitting director gets a to-do** on their own list to brief their Claude, due on the day it
  meets. A to-do on someone else's list hangs under a project task in the to-do rule (migration
  `0136`), so these are written on the server with the service client, after the director gate
  (`addBriefingTodos`), and the to-do rule is unchanged.
- Nothing deletes a meeting or an agenda item, and a directorship or organisation with a meeting on
  record cannot be deleted. `boardroomMeetingRequest.ts`, which the guidance-and-request pattern
  predicts, is an accepted gap: nothing on the site hands a director a request to give their Claude
  yet.

## Chat rooms and subrooms (migration `0271`)

Chat is a module like the others: an administrator switches it on for an organisation, and from then
everyone on the organisation who can use the module may open, rename and archive its rooms at
`/organisations/<id>/chat`. The first step shipped the rooms; the second, below, the messages in them;
the third, moving a stray conversation to the right room; the fourth, a person's own Claude reading
the rooms over the connector; the fifth, that Claude posting, moving and keeping rooms as its person.

- **One row per room** in `chat_rooms`: its name (1 to 60 characters), what it is for (up to 300),
  and the room it sits under when it is a subroom. The limits are stated once in
  `src/lib/data/chat/chatRoomRules.ts`, read by the form actions and the form's fields, and held to
  the migration by `chatRoomsMigration.test.ts`.
- **Subrooms go one level deep.** A room sits under a room that sits under nothing, and a room that
  has subrooms is not put under another; `chatRoomPlacement.ts` refuses both, and the
  `chat_rooms_keep_their_shape` trigger refuses them whatever writes the row.
- **General is the one room every organisation has.** It is listed first, keeps its name, sits under
  nothing and is never archived (a partial unique index keeps one per organisation). The first visit
  to an organisation with no rooms opens General, Operations, Finance and Company decisions in one
  insert; two first visits at once both try, and the unique rules let one through.
- **A room is archived, never deleted.** Archiving a room archives nothing else, so a room is
  archived only once its subrooms are. Names differ, whatever their case, among the rooms sharing a
  parent that are not archived.
- **People read the rooms by the module rule; no policy lets the app write.** The site writes
  through the service role after `requireOrganisationModule` and its own checks, as the Boardroom
  tables are written.

## Messages in a room, with unread counts (migration `0272`)

Each room is opened at `/organisations/<id>/chat/<roomId>`: on a wide screen the room list sits on
the left and the room on the right; on a phone chat home is the list, and the room has a way back
to it. The room shows its name and what it is for, its latest 200 messages oldest first with the
page opened at the newest, each with who said it, when, and a mark when their Claude said it; then
the box to say something. An archived room is read, never written in, and says so. A room of
another organisation, or none, is a 404.

- **One row per thing said** in `chat_messages`: the room (tied to the same organisation by a
  composite key, `on delete restrict`, so a room or organisation with something said in it is never
  deleted), the author's account (no foreign key, so what was said outlives the account), the words
  (1 to 4000 characters), whether it came from the site or their Claude, and the message in the
  same room it answers. The limits are stated once in `src/lib/data/chat/chatMessageRules.ts`, read
  by the form action and the textarea, and held to the migration by `chatMessagesMigration.test.ts`.
  The site always writes `site`; `claude` and the answered message are there for later steps.
- **Nothing said is edited or deleted.** No policy lets anyone change a row, and the service has no
  such function. Posting goes through `postChatMessage`, which refuses blank or over-long words and
  an archived room by name, writes through the service role after `requireOrganisationModule`, and
  moves the author's place to now.
- **Each person's place in a room** is one row of `chat_room_reads`, read only by its own person.
  `mark_chat_room_read` moves it to now and marks their notification for the room read, in one
  step; the room's load calls it (the one write it makes, in `recordRoomOpened`) and so does posting.
- **Unread counts** are the messages newer than the reader's place and not their own; a room never
  opened counts every message not theirs. `chat_unread_counts` counts every room of the organisation
  in one query, and chat home and the room view show each count on their room list.
- **The open room reads itself again every five seconds** while its tab is on screen, through
  SvelteKit's `invalidate` on its own `depends` key (`LiveRefresh`, which now rests while the tab is
  hidden). No websocket, no Realtime, no browser Supabase client.
- **The bell tells of a new message.** `notifications` gains the room and the message, its
  one-subject check is widened to take a room, and a trigger on `chat_messages` tells everyone else
  on the organisation (or the one it sits under), unless they already have an unread notification
  for that room: a partial unique index keeps one per person per room. It opens the room, and
  opening the room marks it read.
- **Authors are named through the service role**, by `withAuthorNames` and the account directory as
  conversations are, because the directory names only the people on a visitor's projects and
  everyone on the organisation talks in its rooms.

## Moving a stray conversation to the right room (migration `0273`)

A team talking in General drifts onto finance; someone presses **Move to room** in the room's
toolbar. Move mode puts a tick box on each message, with **From here on**, which ticks that message
and every later one the room shows. They choose the room to send them to (every room not archived
but this one, subrooms beneath their room) and confirm in a `Modal`; the room then shows the line
the move left, and Move mode ends. Anyone on the organisation who can use chat may move any messages.
Nothing is deleted, and a move is undone by another move back.

- **One row per move** in `chat_moves`: the room left and the room gone to (both tied to the
  organisation by composite keys, `on delete restrict`), who moved them (no foreign key, so the
  record outlives the account), how many (1 to 200) and when. `chat_messages.moved_by_move_id` is
  the latest move that brought a message to the room it is in now. The limit is stated once in
  `src/lib/data/chat/chatMoveRules.ts`, read by the form action and the confirming form, and held to
  the migration by `chatMovesMigration.test.ts`.
- **A move is one step.** `move_chat_messages`, callable by the service role alone, checks every
  message is in the room they leave and in this organisation, that the rooms differ and that the room
  gone to is not archived, writes the move and sets each message's room and move, all or nothing. It
  is the one place a `chat_messages` row is updated, and only its room and its move: a message keeps
  its words, its author and its `created_at`, so moved messages fall into the room they go to in
  their own order and times. It refuses in the same words as `chatMoveRefusals`, and
  `moveChatMessages` passes those refusals on by name: no messages chosen, more than 200, a message
  not in this room, this room, an archived room, a room of another organisation.
- **The marks are read, never written as messages.** The room left shows "Moved 3 messages to
  Finance, by James", linked to that room, in the flow at the moment of the move; each moved message
  carries "moved from General by James". `readChatFlowOfRoom` reads both from `chat_moves`, and
  `chatRoomFlow` places each line among the messages (a move older than every message shown is left
  out when the room shows only its latest 200).
- **What step 2 built keeps working.** Unread counts go by the room a message is in now against the
  reader's place there, so a moved message is new to a reader of the room it went to when it was said
  after their place in that room. The bell's trigger fires on insert alone, so a move writes no
  notification. A reply and the message it answers may now sit in different rooms: the key that tied
  a reply to a message in the same room gave way to one tying it to a message of the same
  organisation.
- **The five-second refresh leaves the ticks alone.** The ticks live in the open room's panel, which
  a refresh keeps, and only the ticked messages still in the room are sent; the panel starts afresh
  when another room is opened.

## A person's own Claude reads the rooms (migration `0274`)

Each director connects their own Claude (or any MCP client) and asks it what is new in the business
chat; it reads the rooms as that person. The connector's `chat` area has three actions, all
`isWrite: false`, run through `run_read_action`, offered to everyone and each gated by `moduleAction`
on the `chat` module of the organisation named, so a caller who may not use that organisation's chat
is told Chat is not switched on for any organisation of theirs with that id.

- **`list_chat_rooms`** gives every room not archived, General first, then rooms by name with their
  subrooms beneath (`chatRoomTree`), each with its id, what it is for and the caller's unread count.
  With no rooms yet it says so and points at the chat home on the site: the rooms are opened by the
  first visit there, never by a read.
- **`read_chat_room`** gives one room of that organisation, archived or not (an archived one says
  so), oldest to newest: each message with who said it by name, when, whether they said it
  themselves or through their Claude, and where it was moved from. `since` is `unread` (the
  default) or `all`; `limit` is 1 to 200, the room's own 200, and 50 when left out. The limits and
  refusals are stated once in `src/lib/data/chat/chatReadingRules.ts` and checked by
  `validateChatReading`. With `unread` it gives the messages the rule below counts, and the moves
  out of the room made after the reader's place, as the room's marker line tells of them
  (`chatFlowWithin`). A room of another organisation is refused by name.
- **`read_chat_unread`** gives everything unread across the rooms, room by room in the list's
  order, leaving out the rooms with nothing new, or one plain line when nothing is.
- **Reading marks nothing read.** None of the three moves the reader's place or marks their
  notification read, so a Claude checking in never hides what is new from its person. Marking read
  is the write `mark_chat_room_read`, below.
- **One unread rule, for the site and the connector.** The connector runs as the service role, for
  which `auth.uid()` is nobody. `chat_unread_messages_for_reader(organisation, reader)` now holds the
  rule (messages newer than the reader's place in the room they are in now, not their own; a room
  never opened counts every message not theirs), and `chat_unread_counts_for_reader` counts it room
  by room; the service role alone may call either. `chat_unread_counts`, which the site calls
  unchanged, counts through the same rule for `auth.uid()`, running as its owner and asking the
  module rule itself.
- **A room notification points at the room.** The connector's notification answer names
  `read_chat_room` with the organisation and room ids, as it names `read_task` for a task.

## A person's own Claude posts, moves and keeps rooms (no migration)

Each director's own Claude takes part in the chat as that person: three directors' Claudes in one
room each post as their own person and read what the others said. The `chat` area gains five
actions, all `isWrite: true`, run through `perform_action`, offered to everyone and each gated by
`moduleAction` on the `chat` module, as the reads are. Each runs the service the page's action runs,
so a refusal reads the same from either; the connector leads a refusal of a field's limit with the
field's name (`body:`, `name:`, `purpose:`), and points a room not found at `list_chat_rooms`
(`chatConnectorRefusal`).

- **`post_chat_message`** says it in a room as the caller through `postChatMessage`, which now takes
  who it is posted through (`ChatAuthor`): `posted_via = 'claude'`, so the room marks it as said
  through their Claude, where the page's form posts `'site'`. Posting moves the author's place in the
  room to now and reads their notification, on the site and here alike.
- **`create_chat_room`** and **`update_chat_room`** run the page's New, Edit and Archive
  (`createChatRoom`, `changeChatRoom`, `archiveChatRoom`). `update_chat_room` changes the fields
  given and keeps every field left out as the room has it (`roomFieldsWithChanges`, in
  `src/lib/data/chat/chatRoomUpdate.ts`, through `updateChatRoom`); `parentRoomId: ""` puts a subroom
  back under nothing. `isArchived: true` archives through the page's Archive, with its refusals
  (General, a room with open subrooms), and is asked alone, as the site's Archive is its own button.
  The site has no way to bring an archived room back, so neither has the connector: `isArchived:
  false` is refused by name.
- **`move_chat_messages`** runs the page's move (`moveChatMessages`), with every refusal it has; a
  room of another organisation is refused as the destination by the rules and as the room the
  messages leave by `move_chat_messages` itself.
- **`mark_chat_room_read`** moves the caller's place in a room of that organisation, archived or not,
  to now and reads its notification (`markRoomReadInOrganisation`, through `markChatRoomRead`).
- **The service is the guard.** The validators the pages and the connector share now refuse a value
  that is not text rather than reading it as text (`validateChatMessageBody`,
  `validateChatRoomFields`); a form only ever sends text, so the site is unchanged.
- **The doctrine.** `get_current_context` carries a short passage on taking part in the chat
  (`src/lib/server/mcp/chatDoctrine.ts`): read what is unread first and say which room each thing
  was said in; post only what the person asked to say or agreed to, in the room the matter belongs
  to, offering to move a drifted talk; never move another person's messages, archive or rename a
  room without the person's yes; mark a room read only once its person has heard what was new; and
  nothing here sends an email or a message outside Your Business Today.
