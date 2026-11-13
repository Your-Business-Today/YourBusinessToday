-- 0210: a person's Claude files an organisation's workflow map in YBT, as whole numbered versions.
--
-- A workflow map reads a company as its people and what passes between them. A line is a role, as a hat
-- someone wears, never a named person. A station is a task that role does, in the order it is done: its
-- name, one sentence on it, what it takes in, what it produces, where it is done, whether it is an output
-- the business runs on, and whether it is done in one of our products, planned for one, or still done
-- elsewhere. A hand-over is one station's output arriving at a station on another line, with what is
-- handed over and, where it goes wrong today, one sentence saying how.
--
-- A version belongs to one organisation and is either a Before (the business as we find it) or an After
-- (the business with our products in it), each numbered from 1. Every filing adds a whole new version; no
-- version is ever updated or deleted. A station keeps its key from version to version and between Before
-- and After, so it keeps its place on the map, and it carries the slugs of the Domain things it takes in
-- and produces.
--
-- file_workflow_map writes one version and everything in it in one transaction. The connector checks every
-- value against these columns first (workflowMapLimits.ts states the same limits); the checks here are the
-- backstop. Nothing here alters, drops or copies from an existing table; the company context's tables stay
-- as they are.
--
-- Read and written by the server only, so row level security is on with no policy. Additive and safe to
-- re-run; the code that reads it stands without it.

begin;

create or replace function public.workflow_map_words_fit(words text[], longest integer, shape text)
returns boolean
language sql
immutable
as $$
	select coalesce(bool_and(char_length(word) between 1 and longest and (shape is null or word ~ shape)), true)
	from unnest(words) as word
$$;

create or replace function public.workflow_map_words(words jsonb)
returns text[]
language sql
immutable
as $$
	select coalesce(array_agg(word order by position), '{}')
	from jsonb_array_elements_text(coalesce(words, '[]'::jsonb)) with ordinality as entry(word, position)
$$;

create table if not exists public.workflow_map_versions (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete cascade,
	stage text not null check (stage in ('before', 'after')),
	version_number integer not null check (version_number >= 1),
	recorded_by uuid references auth.users (id) on delete set null,
	recorded_at timestamptz not null default now(),
	unique (organisation_id, stage, version_number)
);

create table if not exists public.workflow_map_lines (
	id uuid primary key default gen_random_uuid(),
	version_id uuid not null references public.workflow_map_versions (id) on delete cascade,
	line_key text not null check (char_length(line_key) between 1 and 80 and line_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	position integer not null check (position between 1 and 30),
	name text not null check (char_length(name) between 1 and 120),
	unique (version_id, line_key),
	unique (version_id, position)
);

create table if not exists public.workflow_map_stations (
	id uuid primary key default gen_random_uuid(),
	version_id uuid not null references public.workflow_map_versions (id) on delete cascade,
	line_id uuid not null references public.workflow_map_lines (id) on delete cascade,
	station_key text not null check (char_length(station_key) between 1 and 80 and station_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	position integer not null check (position between 1 and 60),
	name text not null check (char_length(name) between 1 and 120),
	summary text not null check (char_length(summary) between 1 and 300),
	takes_in text[] not null default '{}' check (cardinality(takes_in) <= 20 and public.workflow_map_words_fit(takes_in, 120, null)),
	produces text[] not null default '{}' check (cardinality(produces) <= 20 and public.workflow_map_words_fit(produces, 120, null)),
	done_in text check (done_in is null or char_length(done_in) between 1 and 120),
	is_output boolean not null default false,
	state text not null check (state in ('ours', 'planned', 'elsewhere')),
	product_id uuid references public.projects (id) on delete set null,
	takes_in_things text[] not null default '{}' check (
		cardinality(takes_in_things) <= 20 and public.workflow_map_words_fit(takes_in_things, 120, '^[a-z0-9]+(-[a-z0-9]+)*$')
	),
	produces_things text[] not null default '{}' check (
		cardinality(produces_things) <= 20 and public.workflow_map_words_fit(produces_things, 120, '^[a-z0-9]+(-[a-z0-9]+)*$')
	),
	check (state <> 'elsewhere' or product_id is null),
	unique (version_id, station_key),
	unique (line_id, position)
);

create table if not exists public.workflow_map_handovers (
	version_id uuid not null references public.workflow_map_versions (id) on delete cascade,
	from_station_id uuid not null references public.workflow_map_stations (id) on delete cascade,
	to_station_id uuid not null references public.workflow_map_stations (id) on delete cascade,
	position integer not null check (position between 1 and 500),
	handed_over text not null check (char_length(handed_over) between 1 and 120),
	goes_wrong text check (goes_wrong is null or char_length(goes_wrong) between 1 and 300),
	check (from_station_id <> to_station_id),
	primary key (from_station_id, to_station_id),
	unique (version_id, position)
);

create index if not exists workflow_map_stations_version on public.workflow_map_stations (version_id);
create index if not exists workflow_map_stations_product on public.workflow_map_stations (product_id) where product_id is not null;
create index if not exists workflow_map_handovers_version on public.workflow_map_handovers (version_id);

alter table public.workflow_map_versions enable row level security;
alter table public.workflow_map_lines enable row level security;
alter table public.workflow_map_stations enable row level security;
alter table public.workflow_map_handovers enable row level security;

create or replace function public.file_workflow_map(target_organisation uuid, recorder uuid, map jsonb)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	new_version_id uuid;
	new_version_number integer;
	rows_written integer;
	stations_given integer;
begin
	perform pg_advisory_xact_lock(hashtext('workflow_map:' || target_organisation::text || ':' || (map ->> 'stage')));

	select coalesce(max(version_number), 0) + 1 into new_version_number
	from public.workflow_map_versions
	where organisation_id = target_organisation and stage = map ->> 'stage';

	insert into public.workflow_map_versions (organisation_id, stage, version_number, recorded_by)
	values (target_organisation, map ->> 'stage', new_version_number, recorder)
	returning id into new_version_id;

	insert into public.workflow_map_lines (version_id, line_key, position, name)
	select new_version_id, line ->> 'key', line_position, line ->> 'name'
	from jsonb_array_elements(coalesce(map -> 'lines', '[]'::jsonb)) with ordinality as line_entry(line, line_position);

	insert into public.workflow_map_stations (
		version_id, line_id, station_key, position, name, summary, takes_in, produces, done_in,
		is_output, state, product_id, takes_in_things, produces_things
	)
	select new_version_id, line_row.id, station ->> 'key', station_position, station ->> 'name', station ->> 'summary',
		public.workflow_map_words(station -> 'takesIn'), public.workflow_map_words(station -> 'produces'),
		station ->> 'doneIn', coalesce((station ->> 'isOutput')::boolean, false), station ->> 'state',
		(station ->> 'productId')::uuid, public.workflow_map_words(station -> 'takesInThings'),
		public.workflow_map_words(station -> 'producesThings')
	from jsonb_array_elements(coalesce(map -> 'lines', '[]'::jsonb)) as line_entry(line)
	join public.workflow_map_lines line_row
		on line_row.version_id = new_version_id and line_row.line_key = line ->> 'key'
	cross join lateral jsonb_array_elements(coalesce(line -> 'stations', '[]'::jsonb))
		with ordinality as station_entry(station, station_position);
	get diagnostics rows_written = row_count;
	select coalesce(sum(jsonb_array_length(coalesce(line -> 'stations', '[]'::jsonb))), 0) into stations_given
	from jsonb_array_elements(coalesce(map -> 'lines', '[]'::jsonb)) as line_entry(line);
	if rows_written <> stations_given then
		raise exception 'A station sits on a line that is not in this version.';
	end if;

	insert into public.workflow_map_handovers (version_id, from_station_id, to_station_id, position, handed_over, goes_wrong)
	select new_version_id, giver.id, receiver.id, handover_position, handover ->> 'handedOver', handover ->> 'goesWrong'
	from jsonb_array_elements(coalesce(map -> 'handovers', '[]'::jsonb)) with ordinality as handover_entry(handover, handover_position)
	join public.workflow_map_stations giver
		on giver.version_id = new_version_id and giver.station_key = handover ->> 'fromKey'
	join public.workflow_map_stations receiver
		on receiver.version_id = new_version_id and receiver.station_key = handover ->> 'toKey';
	get diagnostics rows_written = row_count;
	if rows_written <> jsonb_array_length(coalesce(map -> 'handovers', '[]'::jsonb)) then
		raise exception 'A hand-over names a station that is not in this version.';
	end if;

	if exists (
		select 1
		from public.workflow_map_handovers handover
		join public.workflow_map_stations giver on giver.id = handover.from_station_id
		join public.workflow_map_stations receiver on receiver.id = handover.to_station_id
		where handover.version_id = new_version_id and giver.line_id = receiver.line_id
	) then
		raise exception 'A hand-over joins two stations on the same line: it goes to a station on another line.';
	end if;

	return new_version_number;
end;
$$;

revoke execute on function public.file_workflow_map(uuid, uuid, jsonb) from public, anon, authenticated;

commit;

notify pgrst, 'reload schema';
