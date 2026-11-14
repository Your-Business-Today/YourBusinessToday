-- 0215: a workflow map says which lines are outside parties or systems, and what arrives from outside to start work.
--
-- A line was always a role, a hat someone wears in the business. Now each line has a kind: role, outside_party (a
-- customer, a supplier, a regulator) or system. Every line filed before this migration keeps the default, role, so
-- every map already filed reads as it did.
--
-- An arrival is something that comes from outside the map to start a station's work: what arrives, who or what it
-- arrives from ("a customer", "the calendar, on the first of the month"), and the station it starts. A version's
-- arrivals are kept in workflow_map_arrivals, shaped and protected as workflow_map_handovers is in 0210: row level
-- security on and no policy, read by the server only after its own access check.
--
-- file_workflow_map is made again, from 0210's, to write each line's kind and the arrivals. A map filed without them
-- is filed as before: every line a role and no arrivals. The connector checks every value against these columns
-- first (workflowMapLimits.ts states the same limits); the checks here are the backstop.
--
-- Additive and safe to run twice: it adds one column with a default and one table, and alters, drops or copies no
-- row that holds data.

begin;

alter table public.workflow_map_lines add column if not exists kind text not null default 'role';

do $$
begin
	if not exists (select 1 from pg_constraint where conname = 'workflow_map_lines_kind_check') then
		alter table public.workflow_map_lines
			add constraint workflow_map_lines_kind_check check (kind in ('role', 'outside_party', 'system'));
	end if;
end;
$$;

create table if not exists public.workflow_map_arrivals (
	version_id uuid not null references public.workflow_map_versions (id) on delete cascade,
	station_id uuid not null references public.workflow_map_stations (id) on delete cascade,
	position integer not null check (position between 1 and 100),
	what_arrives text not null check (char_length(what_arrives) between 1 and 120),
	arrives_from text not null check (char_length(arrives_from) between 1 and 120),
	primary key (station_id, what_arrives),
	unique (version_id, position)
);

create index if not exists workflow_map_arrivals_version on public.workflow_map_arrivals (version_id);

alter table public.workflow_map_arrivals enable row level security;

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

	insert into public.workflow_map_lines (version_id, line_key, position, name, kind)
	select new_version_id, line ->> 'key', line_position, line ->> 'name', coalesce(line ->> 'kind', 'role')
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

	insert into public.workflow_map_arrivals (version_id, station_id, position, what_arrives, arrives_from)
	select new_version_id, started.id, arrival_position, arrival ->> 'whatArrives', arrival ->> 'arrivesFrom'
	from jsonb_array_elements(coalesce(map -> 'arrivals', '[]'::jsonb)) with ordinality as arrival_entry(arrival, arrival_position)
	join public.workflow_map_stations started
		on started.version_id = new_version_id and started.station_key = arrival ->> 'stationKey';
	get diagnostics rows_written = row_count;
	if rows_written <> jsonb_array_length(coalesce(map -> 'arrivals', '[]'::jsonb)) then
		raise exception 'An arrival names a station that is not in this version.';
	end if;

	return new_version_number;
end;
$$;

revoke execute on function public.file_workflow_map(uuid, uuid, jsonb) from public, anon, authenticated;

commit;

notify pgrst, 'reload schema';
