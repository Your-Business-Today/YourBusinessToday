-- 0211: a person's Claude files a product's journeys, as numbered versions, and reads them back.
--
-- A journey map is a product read as how people travel through it: its views,
-- one screen each by route; which view leads to which; where a person arrives;
-- and each role's journeys, one user story's path through the views in order,
-- which can name the workflow map station it carries out. Every filing adds a
-- whole new version, numbered from 1 for each product, with the commit it was
-- read from; no version is ever updated or deleted.
--
-- file_project_site_map writes one version and everything in it in one
-- transaction, so a version is never half written, and refuses a link, an entry
-- point or a journey step that names a route the version does not hold. The
-- connector checks every value against these columns first
-- (journeyMapLimits.ts states the same limits); the checks here are the
-- backstop. read_project_site_map_version reads the latest version back whole,
-- in the shape it was filed.
--
-- The kit's site definition and MCP map readings (0107, 0108) are left alone:
-- they still supply the wireframes and the tools.
--
-- Read and written by the server only, so row level security is on with no
-- policy. New tables under their own names: nothing existing is altered.
-- Additive and safe to re-run; the code that reads it stands without it.

begin;

create table if not exists public.project_site_map_versions (
	id uuid primary key default gen_random_uuid(),
	project_id uuid not null references public.projects (id) on delete cascade,
	version_number integer not null check (version_number >= 1),
	commit_sha text not null check (commit_sha ~ '^[0-9a-f]{7,40}$'),
	filed_by uuid references auth.users (id) on delete set null,
	filed_at timestamptz not null default now(),
	unique (project_id, version_number)
);

create table if not exists public.project_site_map_views (
	id uuid primary key default gen_random_uuid(),
	version_id uuid not null references public.project_site_map_versions (id) on delete cascade,
	route text not null check (char_length(route) between 1 and 300 and route ~ '^/'),
	name text not null check (char_length(name) between 1 and 120),
	purpose text not null check (char_length(purpose) between 1 and 1000),
	shows text check (shows is null or char_length(shows) between 1 and 120),
	unique (version_id, route)
);

create table if not exists public.project_site_map_links (
	version_id uuid not null references public.project_site_map_versions (id) on delete cascade,
	from_view_id uuid not null references public.project_site_map_views (id) on delete cascade,
	to_view_id uuid not null references public.project_site_map_views (id) on delete cascade,
	how text check (how is null or char_length(how) between 1 and 200),
	check (from_view_id <> to_view_id),
	primary key (from_view_id, to_view_id)
);

create index if not exists project_site_map_links_version on public.project_site_map_links (version_id);

create table if not exists public.project_site_map_entry_points (
	version_id uuid not null references public.project_site_map_versions (id) on delete cascade,
	view_id uuid not null references public.project_site_map_views (id) on delete cascade,
	arrives_by text not null check (char_length(arrives_by) between 1 and 120),
	primary key (view_id, arrives_by)
);

create index if not exists project_site_map_entry_points_version on public.project_site_map_entry_points (version_id);

create table if not exists public.project_site_map_journeys (
	id uuid primary key default gen_random_uuid(),
	version_id uuid not null references public.project_site_map_versions (id) on delete cascade,
	journey_key text not null check (char_length(journey_key) between 1 and 80 and journey_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	name text not null check (char_length(name) between 1 and 120),
	role text not null check (char_length(role) between 1 and 80),
	story text not null check (char_length(story) between 1 and 500),
	station_key text check (station_key is null or (char_length(station_key) between 1 and 80 and station_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$')),
	unique (version_id, journey_key)
);

create table if not exists public.project_site_map_journey_steps (
	journey_id uuid not null references public.project_site_map_journeys (id) on delete cascade,
	position integer not null check (position between 1 and 50),
	view_id uuid not null references public.project_site_map_views (id) on delete cascade,
	does text check (does is null or char_length(does) between 1 and 300),
	primary key (journey_id, position)
);

create index if not exists project_site_map_journey_steps_view on public.project_site_map_journey_steps (view_id);

alter table public.project_site_map_versions enable row level security;
alter table public.project_site_map_views enable row level security;
alter table public.project_site_map_links enable row level security;
alter table public.project_site_map_entry_points enable row level security;
alter table public.project_site_map_journeys enable row level security;
alter table public.project_site_map_journey_steps enable row level security;

create or replace function public.file_project_site_map(target_project uuid, filer uuid, site_map jsonb)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	new_version_id uuid;
	new_version_number integer;
	rows_written integer;
	steps_given integer;
begin
	perform pg_advisory_xact_lock(hashtext('project_site_map:' || target_project::text));

	select coalesce(max(version_number), 0) + 1 into new_version_number
	from public.project_site_map_versions
	where project_id = target_project;

	insert into public.project_site_map_versions (project_id, version_number, commit_sha, filed_by)
	values (target_project, new_version_number, site_map ->> 'commit', filer)
	returning id into new_version_id;

	insert into public.project_site_map_views (version_id, route, name, purpose, shows)
	select new_version_id, given_view ->> 'route', given_view ->> 'name', given_view ->> 'purpose', given_view ->> 'shows'
	from jsonb_array_elements(coalesce(site_map -> 'views', '[]'::jsonb)) as given_view;

	insert into public.project_site_map_links (version_id, from_view_id, to_view_id, how)
	select new_version_id, from_view.id, to_view.id, link ->> 'how'
	from jsonb_array_elements(coalesce(site_map -> 'links', '[]'::jsonb)) as link
	join public.project_site_map_views from_view
		on from_view.version_id = new_version_id and from_view.route = link ->> 'fromRoute'
	join public.project_site_map_views to_view
		on to_view.version_id = new_version_id and to_view.route = link ->> 'toRoute';
	get diagnostics rows_written = row_count;
	if rows_written <> jsonb_array_length(coalesce(site_map -> 'links', '[]'::jsonb)) then
		raise exception 'A link names a route that is not a view of this version.';
	end if;

	insert into public.project_site_map_entry_points (version_id, view_id, arrives_by)
	select new_version_id, entry_view.id, entry_point ->> 'arrivesBy'
	from jsonb_array_elements(coalesce(site_map -> 'entryPoints', '[]'::jsonb)) as entry_point
	join public.project_site_map_views entry_view
		on entry_view.version_id = new_version_id and entry_view.route = entry_point ->> 'route';
	get diagnostics rows_written = row_count;
	if rows_written <> jsonb_array_length(coalesce(site_map -> 'entryPoints', '[]'::jsonb)) then
		raise exception 'An entry point names a route that is not a view of this version.';
	end if;

	insert into public.project_site_map_journeys (version_id, journey_key, name, role, story, station_key)
	select new_version_id, journey ->> 'key', journey ->> 'name', journey ->> 'role', journey ->> 'story',
		journey ->> 'stationKey'
	from jsonb_array_elements(coalesce(site_map -> 'journeys', '[]'::jsonb)) as journey;

	insert into public.project_site_map_journey_steps (journey_id, position, view_id, does)
	select filed_journey.id, step.step_number::integer, step_view.id, step.value ->> 'does'
	from jsonb_array_elements(coalesce(site_map -> 'journeys', '[]'::jsonb)) as journey
	join public.project_site_map_journeys filed_journey
		on filed_journey.version_id = new_version_id and filed_journey.journey_key = journey ->> 'key'
	cross join lateral jsonb_array_elements(coalesce(journey -> 'steps', '[]'::jsonb)) with ordinality as step(value, step_number)
	join public.project_site_map_views step_view
		on step_view.version_id = new_version_id and step_view.route = step.value ->> 'route';
	get diagnostics rows_written = row_count;
	select coalesce(sum(jsonb_array_length(coalesce(journey -> 'steps', '[]'::jsonb))), 0) into steps_given
	from jsonb_array_elements(coalesce(site_map -> 'journeys', '[]'::jsonb)) as journey;
	if rows_written <> steps_given then
		raise exception 'A journey step names a route that is not a view of this version.';
	end if;

	return new_version_number;
end;
$$;

revoke execute on function public.file_project_site_map(uuid, uuid, jsonb) from public, anon, authenticated;

create or replace function public.read_project_site_map_version(target_project uuid)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
	select jsonb_build_object(
		'versionNumber', version.version_number,
		'commit', version.commit_sha,
		'filedAt', version.filed_at,
		'views', coalesce((
			select jsonb_agg(jsonb_build_object(
				'route', map_view.route, 'name', map_view.name, 'purpose', map_view.purpose, 'shows', map_view.shows
			) order by map_view.route)
			from public.project_site_map_views map_view
			where map_view.version_id = version.id
		), '[]'::jsonb),
		'links', coalesce((
			select jsonb_agg(jsonb_build_object(
				'fromRoute', from_view.route, 'toRoute', to_view.route, 'how', link.how
			) order by from_view.route, to_view.route)
			from public.project_site_map_links link
			join public.project_site_map_views from_view on from_view.id = link.from_view_id
			join public.project_site_map_views to_view on to_view.id = link.to_view_id
			where link.version_id = version.id
		), '[]'::jsonb),
		'entryPoints', coalesce((
			select jsonb_agg(jsonb_build_object(
				'route', entry_view.route, 'arrivesBy', entry_point.arrives_by
			) order by entry_view.route, entry_point.arrives_by)
			from public.project_site_map_entry_points entry_point
			join public.project_site_map_views entry_view on entry_view.id = entry_point.view_id
			where entry_point.version_id = version.id
		), '[]'::jsonb),
		'journeys', coalesce((
			select jsonb_agg(jsonb_build_object(
				'key', journey.journey_key, 'name', journey.name, 'role', journey.role,
				'story', journey.story, 'stationKey', journey.station_key,
				'steps', coalesce((
					select jsonb_agg(jsonb_build_object(
						'route', step_view.route, 'does', step.does
					) order by step.position)
					from public.project_site_map_journey_steps step
					join public.project_site_map_views step_view on step_view.id = step.view_id
					where step.journey_id = journey.id
				), '[]'::jsonb)
			) order by journey.role, journey.name, journey.journey_key)
			from public.project_site_map_journeys journey
			where journey.version_id = version.id
		), '[]'::jsonb)
	)
	from public.project_site_map_versions version
	where version.project_id = target_project
	order by version.version_number desc
	limit 1;
$$;

revoke execute on function public.read_project_site_map_version(uuid) from public, anon, authenticated;

commit;

notify pgrst, 'reload schema';
