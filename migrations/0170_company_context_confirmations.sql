-- 0170: a client confirms their company context is right, and YBT is told.
--
-- Confirming keeps one version as the confirmed context: one row per version, saying who confirmed it and when.
-- A version is never changed after it is kept, so a confirmed version stays exactly as the client confirmed it;
-- a later revision is a new version, with no row here until the client confirms that one too. A row is never
-- updated or deleted. The portal confirms only once no part of the version is marked not right.
--
-- YBT is told on the client's history: client_events gains the kind context_confirmed. The check is put back
-- with every kind it held before, so no row already there changes or fails it, and running this again changes
-- nothing.
--
-- Read and written by the server only, so row level security is on with no policy. Additive and safe to re-run;
-- the map and the connector stand without it.

begin;

create table if not exists public.company_context_confirmations (
	version_id uuid primary key references public.company_context_versions (id) on delete cascade,
	confirmed_by uuid references auth.users (id) on delete set null,
	confirmed_at timestamptz not null default now()
);

alter table public.company_context_confirmations enable row level security;

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
		'context_confirmed'
	));

commit;

notify pgrst, 'reload schema';
