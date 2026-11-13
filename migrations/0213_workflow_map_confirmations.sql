-- 0213: a client confirms their workflow map is right, YBT is told, and the services we build are raised from it.
--
-- Confirming keeps one version of a Before or an After as confirmed: one row per version, saying who confirmed it
-- and when. A filed version is never changed, so a confirmed version stays exactly as the client confirmed it; a
-- later filing is a new version, with no row here until the client confirms that one too. A row is never updated
-- or deleted. The portal confirms only once no station of the version is marked not right, and a confirmed Before
-- is frozen: the connector files no further Before for that organisation.
--
-- YBT is told on the client's history: client_events gains the kind workflow_map_confirmed. The check is put back
-- from the newest migration that set it (0209) with every kind it held, so no row already there changes or fails
-- it, and running this again changes nothing.
--
-- goals gains workflow_map_version_id: the confirmed version a goal was raised from, empty for every goal raised
-- any other way, so no goal already there changes. It sits beside context_version_id, which is left as it is. A
-- version is never deleted while its organisation stands; if one ever is, the goal stays and only loses the link.
--
-- The client sees each goal on the portal through portal_goals (migrations 0100 and 0171). The view is put back
-- with every column it held, in the same order, and the stage and number of the workflow map version a goal came
-- from added last, so the portal can link the goal back to Your workflow map. The view reads the version as its
-- owner, as it reads the goal, so the map's own tables keep row level security with no policy.
--
-- Read and written by the server only, so row level security is on with no policy. Additive and safe to re-run;
-- the portal and the connector stand without it.

begin;

create table if not exists public.workflow_map_confirmations (
	version_id uuid primary key references public.workflow_map_versions (id) on delete cascade,
	confirmed_by uuid references auth.users (id) on delete set null,
	confirmed_at timestamptz not null default now()
);

alter table public.workflow_map_confirmations enable row level security;

alter table public.client_events drop constraint if exists client_events_kind_check;
alter table public.client_events add constraint client_events_kind_check
	check (kind in (
		'stage_moved',
		'contact_added',
		'contact_invited',
		'contact_removed',
		'administrator_changed',
		'project_assigned',
		'request_raised',
		'request_decided',
		'request_promoted',
		'build_dispatched',
		'build_live',
		'enquiry_received',
		'lead_added',
		'profile_researched',
		'approach_drafted',
		'person_added',
		'appointments_imported',
		'officers_imported',
		'grouped_under',
		'person_researched',
		'sighted',
		'client_set_up',
		'context_confirmed',
		'owner_changed',
		'workflow_map_confirmed'
	));

alter table public.goals
	add column if not exists workflow_map_version_id uuid references public.workflow_map_versions (id) on delete set null;

create index if not exists goals_workflow_map_version_id_idx on public.goals (workflow_map_version_id);

create or replace view public.portal_goals with (security_invoker = false, security_barrier = true) as
	select goal.id, goal.project_id, goal.title, goal.measure, goal.status, goal.horizon, goal.priority,
		version.version_number as context_version_number,
		map_version.stage as workflow_map_stage,
		map_version.version_number as workflow_map_version_number
	from public.goals as goal
	left join public.company_context_versions as version on version.id = goal.context_version_id
	left join public.workflow_map_versions as map_version on map_version.id = goal.workflow_map_version_id
	where public.is_client_contact_on_project(goal.project_id);

revoke all on public.portal_goals from public, anon, authenticated;
grant select on public.portal_goals to authenticated;

commit;

notify pgrst, 'reload schema';
