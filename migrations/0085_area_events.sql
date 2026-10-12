-- 0085: everything that happens on the ground a patch covers is one row in
-- area_events, keyed to the outcode and sector rather than the patch, so two
-- patches that share a sector both see it. One door writes it:
-- record_area_event, which refuses anyone but staff and the service role, so
-- the site's commands, the connector and the loaders all write the same way
-- and nobody forges an event. A source key makes a loader re-run write once.
-- The kinds are rows, so a later step adds one by inserting it. Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

create table if not exists public.area_event_kinds (
	kind text primary key,
	label text not null
);

insert into public.area_event_kinds (kind, label) values
	('sector_claimed', 'Sector claimed'),
	('sector_searched', 'Sector searched'),
	('sighting_recorded', 'Sighting recorded'),
	('sighting_became_lead', 'Sighting became a lead'),
	('lead_added_from_register', 'Lead added from the register')
on conflict (kind) do update set label = excluded.label;

create table if not exists public.area_events (
	id uuid primary key default gen_random_uuid(),
	outcode text not null,
	sector text not null default '',
	patch_id uuid references public.patches (id) on delete set null,
	kind text not null references public.area_event_kinds (kind),
	company_number text not null default '',
	sighting_id uuid references public.sightings (id) on delete set null,
	client_id uuid references public.clients (id) on delete set null,
	detail text not null default '',
	source_url text not null default '',
	source_key text not null default '',
	happened_at date,
	actor_account_id uuid references public.profiles (id) on delete set null,
	created_at timestamptz not null default now()
);

create index if not exists area_events_by_outcode_time on public.area_events (outcode, created_at desc);
create unique index if not exists area_events_once_per_source_key
	on public.area_events (source_key) where source_key <> '';

alter table public.area_event_kinds enable row level security;
alter table public.area_events enable row level security;

drop policy if exists "project managers read area event kinds" on public.area_event_kinds;
create policy "project managers read area event kinds" on public.area_event_kinds
	for select using (public.is_project_manager());

drop policy if exists "project managers read area events" on public.area_events;
create policy "project managers read area events" on public.area_events
	for select using (public.is_project_manager());

create or replace function public.record_area_event(
	event_outcode text,
	event_sector text,
	event_patch_id uuid,
	event_kind text,
	event_company_number text default '',
	event_sighting_id uuid default null,
	event_client_id uuid default null,
	event_detail text default '',
	event_source_url text default '',
	event_source_key text default '',
	event_happened_at date default null,
	event_actor uuid default null
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	event_id uuid;
begin
	if not (public.is_project_manager() or auth.role() = 'service_role') then
		raise exception 'Only staff and the service role record area events' using errcode = '42501';
	end if;
	insert into public.area_events (
		outcode, sector, patch_id, kind, company_number, sighting_id, client_id,
		detail, source_url, source_key, happened_at, actor_account_id
	)
	values (
		event_outcode, event_sector, event_patch_id, event_kind, event_company_number, event_sighting_id,
		event_client_id, event_detail, event_source_url, event_source_key, event_happened_at, event_actor
	)
	on conflict (source_key) where source_key <> '' do nothing
	returning id into event_id;
	return event_id;
end;
$$;

commit;

notify pgrst, 'reload schema';
