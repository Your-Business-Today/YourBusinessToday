-- 0151: a client's Claude keeps the company context in YBT, as numbered versions.
--
-- Each organisation has one company context: the areas of its business, the
-- sources where work is created, the kinds of record it keeps, its processes
-- with their steps, and its roles, with the links between them; what the
-- client has connected in Claude; and the step of the offer it is on. Every
-- run adds a whole new version, numbered from 1 for each organisation; no
-- version is ever updated or deleted, so every earlier reading is kept.
--
-- Concepts, not specimens: a part names a role or a kind of record, never a
-- person, a customer or their figures, and where it was seen names the
-- connector and the place, never the content. The connector refuses email
-- addresses and phone numbers before anything is written.
--
-- record_company_context writes one version and everything in it in one
-- transaction, so a version is never half written. The connector checks every
-- value against these columns first (companyContextLimits.ts states the same
-- limits); the checks here are the backstop.
--
-- Read and written by the server only, so row level security is on with no
-- policy. Additive and safe to re-run; the code that reads it stands without it.

begin;

create table if not exists public.company_context_versions (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete cascade,
	version_number integer not null check (version_number >= 1),
	stage text not null check (stage in (
		'map-data-sources', 'data-harness', 'web-app', 'ai-connector',
		'assistant-skills', 'run-in-the-open', 'change-it-however-you-want'
	)),
	recorded_by uuid references auth.users (id) on delete set null,
	recorded_at timestamptz not null default now(),
	unique (organisation_id, version_number)
);

create table if not exists public.company_context_connectors (
	version_id uuid not null references public.company_context_versions (id) on delete cascade,
	name text not null check (char_length(name) between 1 and 80),
	primary key (version_id, name)
);

create table if not exists public.company_context_parts (
	id uuid primary key default gen_random_uuid(),
	version_id uuid not null references public.company_context_versions (id) on delete cascade,
	part_key text not null check (char_length(part_key) between 1 and 80 and part_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	kind text not null check (kind in ('context', 'source', 'record', 'process', 'role')),
	name text not null check (char_length(name) between 1 and 120),
	description text check (description is null or char_length(description) between 1 and 1000),
	is_core boolean not null default false check (not is_core or kind = 'context'),
	seen_in_connector text check (seen_in_connector is null or char_length(seen_in_connector) between 1 and 80),
	seen_at_place text check (seen_at_place is null or char_length(seen_at_place) between 1 and 300),
	confidence text not null check (confidence in ('high', 'medium', 'low')),
	review_state text not null default 'not_checked' check (review_state in ('not_checked', 'right', 'not_right')),
	what_is_wrong text check (what_is_wrong is null or char_length(what_is_wrong) between 1 and 1000),
	check ((review_state = 'not_right') = (what_is_wrong is not null)),
	check (seen_at_place is null or seen_in_connector is not null),
	unique (version_id, part_key)
);

create unique index if not exists company_context_parts_one_core
	on public.company_context_parts (version_id) where is_core;

create table if not exists public.company_context_steps (
	process_part_id uuid not null references public.company_context_parts (id) on delete cascade,
	position integer not null check (position between 1 and 50),
	description text not null check (char_length(description) between 1 and 300),
	role_part_id uuid references public.company_context_parts (id) on delete cascade,
	primary key (process_part_id, position)
);

create table if not exists public.company_context_links (
	version_id uuid not null references public.company_context_versions (id) on delete cascade,
	from_part_id uuid not null references public.company_context_parts (id) on delete cascade,
	kind text not null check (kind in ('creates', 'is_created_by', 'goes_next_to')),
	to_part_id uuid not null references public.company_context_parts (id) on delete cascade,
	check (from_part_id <> to_part_id),
	primary key (from_part_id, kind, to_part_id)
);

create index if not exists company_context_links_version on public.company_context_links (version_id);

alter table public.company_context_versions enable row level security;
alter table public.company_context_connectors enable row level security;
alter table public.company_context_parts enable row level security;
alter table public.company_context_steps enable row level security;
alter table public.company_context_links enable row level security;

create or replace function public.record_company_context(target_organisation uuid, recorder uuid, context jsonb)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	new_version_id uuid;
	new_version_number integer;
	rows_written integer;
begin
	perform pg_advisory_xact_lock(hashtext('company_context:' || target_organisation::text));

	select coalesce(max(version_number), 0) + 1 into new_version_number
	from public.company_context_versions
	where organisation_id = target_organisation;

	insert into public.company_context_versions (organisation_id, version_number, stage, recorded_by)
	values (target_organisation, new_version_number, context ->> 'stage', recorder)
	returning id into new_version_id;

	insert into public.company_context_connectors (version_id, name)
	select new_version_id, connector
	from jsonb_array_elements_text(coalesce(context -> 'connectors', '[]'::jsonb)) as connector;

	insert into public.company_context_parts (
		version_id, part_key, kind, name, description, is_core,
		seen_in_connector, seen_at_place, confidence, review_state, what_is_wrong
	)
	select new_version_id, part ->> 'key', part ->> 'kind', part ->> 'name', part ->> 'description',
		coalesce((part ->> 'isCore')::boolean, false), part ->> 'seenInConnector', part ->> 'seenAtPlace',
		part ->> 'confidence', part ->> 'reviewState', part ->> 'whatIsWrong'
	from jsonb_array_elements(coalesce(context -> 'parts', '[]'::jsonb)) as part;

	insert into public.company_context_steps (process_part_id, position, description, role_part_id)
	select process.id, (step ->> 'position')::integer, step ->> 'description', role.id
	from jsonb_array_elements(coalesce(context -> 'steps', '[]'::jsonb)) as step
	join public.company_context_parts process
		on process.version_id = new_version_id and process.part_key = step ->> 'processKey' and process.kind = 'process'
	left join public.company_context_parts role
		on role.version_id = new_version_id and role.part_key = step ->> 'roleKey' and role.kind = 'role';
	get diagnostics rows_written = row_count;
	if rows_written <> jsonb_array_length(coalesce(context -> 'steps', '[]'::jsonb)) then
		raise exception 'A step names a process that is not in this version.';
	end if;

	insert into public.company_context_links (version_id, from_part_id, kind, to_part_id)
	select new_version_id, from_part.id, link ->> 'kind', to_part.id
	from jsonb_array_elements(coalesce(context -> 'links', '[]'::jsonb)) as link
	join public.company_context_parts from_part
		on from_part.version_id = new_version_id and from_part.part_key = link ->> 'fromKey'
	join public.company_context_parts to_part
		on to_part.version_id = new_version_id and to_part.part_key = link ->> 'toKey';
	get diagnostics rows_written = row_count;
	if rows_written <> jsonb_array_length(coalesce(context -> 'links', '[]'::jsonb)) then
		raise exception 'A link names a part that is not in this version.';
	end if;

	return new_version_number;
end;
$$;

revoke execute on function public.record_company_context(uuid, uuid, jsonb) from public, anon, authenticated;

commit;

notify pgrst, 'reload schema';
