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
