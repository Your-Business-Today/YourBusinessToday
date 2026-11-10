# Organisations — Architecture

Who each project is for, and who reaches it because of that. Before this, access to a project
was one relationship at a time: the owner, and the members invited by email, project by project.
A client with several businesses — Jewel Enterprises, with Jewel Bespoke Build, Jewel Passive
Fire Protection and Jewel Property Serve — had its people invited to each of a dozen projects by
hand, and a new project started with nobody on it. Your Business Today's own projects were the
projects under no client at all.

## The abstraction

**An organisation is the party a set of projects belongs to.** A client, or Your Business Today
itself. It carries the address and the accounts contact a later accounts integration will read
(`organisations`, migration `0075`), and it can have **sub-organisations**: the businesses under
it, each able to override those details field by field so it is invoiced on its own
(`invoicingDetailsOf` in `src/lib/data/organisationInvoicing.ts`). A sub-organisation has no
sub-organisations of its own; the database refuses a deeper tree.

**A project names its organisation** (`projects.organisation_id`), or none. A project under no
organisation is a personal one: reached by its owner and the people invited to it, as before.

**People are on an organisation as members or as project managers** (`organisation_members`).
A member reaches every project under the organisation; a member of a parent reaches every
project under its sub-organisations too. A project manager also brings people on and takes them
off — on the organisation they manage and on everything under it, never above. Staff and
administrators reach and manage every organisation.

**Reach is materialised, not inferred.** Every project membership an organisation grants is a
`project_members` row marked with `via_organisation_id`. The rule is one pure function,
`deriveProjectMemberships` in `src/lib/data/organisationAccess.ts`: each person on a project's
organisation or on the one above it is on the project, unless they own it. `syncOrganisationAccess`
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
| Staff or a project manager | to add a sub-organisation that overrides those details | one business of a client is invoiced separately |
| Staff | to make someone the project manager of an organisation or sub-organisation | the client runs its own access |
| Project manager | to bring people on to the organisation, a sub-organisation or one project, by email | they see what they should and nothing else |
| Member of an organisation | to be on every project under it, including each new one, at once | nobody invites me project by project |
| Anyone with projects | to filter the projects page by organisation | I see one client's work at a time |

## The views

- `/organisations` — the register: every organisation the person is on (staff: every one), each
  parent with its businesses indented beneath it, counting projects, people and sub-organisations.
  Staff create an organisation here.
- `/organisations/[organisationId]` — one organisation: its projects (its own and its businesses'),
  its sub-organisations (a top-level organisation only; a manager adds one), its people with their
  standing (a manager invites by email, makes or unmakes a manager, removes), and how it is invoiced,
  each inherited field marked with the parent it comes from. Staff delete here; the projects stay,
  under no organisation.
- `/projects` — an organisation chip row above the boards narrows both My projects and Team
  projects to one organisation and its businesses; every tile carries its organisation; the new and
  edit forms choose one.
- `/projects/[projectId]` — the organisation beside the status; a person on the project through an
  organisation is marked with it in the People panel and cannot be removed there.
- The Organisations link joins the Work menu for staff and for anyone an organisation has brought on.

## The connector

Area `organisations`: `list_organisations`, `read_organisation` (invoicing, people, businesses,
projects), `create_organisation` (staff), `create_sub_organisation`, `update_organisation_details`,
`invite_to_organisation`, `set_organisation_manager`, `remove_organisation_member` and
`set_project_organisation`. `create_project` names an organisation; `list_projects` narrows to one;
`list_project_people` says which organisation brought a member; `remove_project_member` refuses one.
`get_current_context` tells a connected Claude which organisations its person is on and whether
they manage them. The gate is the same pure model the site uses (`isOnOrganisation`,
`managesOrganisation`), read against the caller's `organisationMemberships`.

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

`src/lib/data/organisationAccess.test.ts` is the model: lineage, who manages what, who reaches
which project. `src/lib/data/jewelPassiveFireAccess.test.ts` is Jeremy adding someone to Jewel
Passive Fire Protection and that person passing the gate every task action stands behind on the
Passive Fire projects, and being refused everywhere else. `organisationInvoicing.test.ts`,
`organisationRules.test.ts` and `organisationFilter.test.ts` cover the override, the column rules
and the projects filter. The database side — the policies, the functions, the seed — is proved by
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

`src/lib/data/organisationCopyDown.test.ts` proves the model side: Jewel Enterprises' people copied
down to its companies leave everyone on the same projects, with each grant marked as the migration
marks it, and still on them once the grouping is no longer read; a filled company is invoiced as
before, with or without its parent.

## Directors, and who enters the boardroom (migration `0150`)

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
