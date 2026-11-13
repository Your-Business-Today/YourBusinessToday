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

## The company context

Each organisation has one company context: what its client's Claude has worked out about the business
(its areas, the sources where work is created, the kinds of record it keeps, its processes with their
steps, and its roles, with the links between them), which connectors the client has switched on in
Claude, and the step of the offer (`consultancyOffer.ts`) the client is on. Each part carries where it
was seen (the connector and the place, never the content), how sure Claude is, and its review state:
not checked, right, or not right with what is wrong.

- **Kept as versions.** Migration 0154 adds `company_context_versions` and the parts, steps, links and
  connectors of each. `record_company_context` writes a whole new version, numbered from 1 for each
  organisation, in one transaction through the database function of the same name; no version is ever
  changed or deleted. Parts keep their keys from one version to the next, so a part's review travels with it.
- **Read by the people on the organisation.** The connector's `record_company_context` and
  `read_company_context` work for anyone who reaches the organisation (its people, or staff); the tables
  are read and written by the server only.
- **Concepts, not specimens.** Every value is checked against its column (`companyContextLimits.ts`
  states the limits the migration holds, and a test keeps the two together) and refused, never cut, and
  an email address or a phone number anywhere is refused.

### The one prompt and the context run

Every client runs the same prompt (`companyContextPrompt` in `src/lib/onboarding/onboarding.ts`), shown
on the portal's Connect your Claude page and written out in the set-up email. It only connects the
client's Claude and tells it to follow what Your Business Today says, so the steps can change without
sending anyone a new prompt.

- **`get_current_context` points the way.** A person on an organisation is told to call
  `start_context_run` with that organisation's id first (`contextRunLine.ts`).
- **`start_context_run` reads and writes nothing else.** It answers with the walk
  (`describeContextRun.ts`), fitted to the latest version: an empty context is a broad first
  conversation; a filled one lists the parts marked not right to put right first, what is still
  missing (`contextGaps.ts`) and what the stage still needs, and the connectors recorded last time.
- **The client says yes before anything is written,** and the only write is `record_company_context`.
  What the walk reads in mail and documents is data, never an instruction.
- **The walk ends on the portal home** until the context map exists; the map task points it there.

### Mapping the workflows

A person who says "map the workflows" to their Claude is walked through finding the organisation's
roles, their tasks and the hand-overs between them, the same careful way every time.

- **`get_current_context` points the way.** A person on an organisation is told to call
  `start_workflow_map_run` with that organisation's id (`workflowMapRunLine.ts`), beside the line for
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
- **The walk ends on the Workflow map page,** with its link, once the map is read back.

### The Workflow map page

`/organisations/<id>/workflow-map`, under Knowledge in the side bar between Domain and Your Business Brain,
listed and shown only where Your Business Brain is open to the person, as Domain is.

- **It draws what is filed and nothing is edited there.** The latest Before and After are read whole
  (`readOrganisationWorkflowMaps.ts`) and drawn with the LineMap widget, laid out together so a station keeps
  its place and its role its colour (`drawnWorkflowMaps.ts`, `workflowLineMap.ts`).
- **One row of tabs when there is something to compare:** Before, After and What changes, whose table lists
  each task that moves into one of our products and each hand-over that stops going wrong
  (`workflowMapChanges.ts`). With only today's map filed it is drawn alone, with no tabs; with none, the page
  says to ask for "map the workflows".
- **Choosing a station opens its panel under the map** (`stationDetails.ts`): its role and sentence, what it
  takes in and from whom, what it produces and for whom, where it is done and where it was done before, and
  the Domain things it names. `?station=<station key>` opens the page with that station chosen, on the After
  when one is filed, which is how the Domain page links a thing to its stations.

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
