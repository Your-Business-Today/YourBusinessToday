-- 0212: a client marks each station of their workflow map right or not right, from the portal or through their Claude.
--
-- Each mark is a row of its own, kept beside the station of the version it was made on: who made it, when, and,
-- when the station is not right, what is wrong in the client's own words. A mark is never updated or deleted, so a
-- client who changes their mind adds a newer mark and every earlier one is kept.
--
-- A station's standing is its latest mark. A mark carries forward while the station is unchanged: a later version
-- of the same stage whose station has the same key, on the same line, reading exactly as it did, stands as it was
-- marked until the client marks it again. workflow_map_station_standings works that out for one version.
--
-- The portal and the connector check every value against these columns first (stationReviewLimits.ts states the
-- same limits); the checks here are the backstop. Read and written by the server only, so row level security is
-- on with no policy. Nothing here alters, drops or copies from an existing table. Additive and safe to re-run; the
-- map and the connector stand without it.

begin;

create table if not exists public.workflow_map_station_reviews (
	id uuid primary key default gen_random_uuid(),
	station_id uuid not null references public.workflow_map_stations (id) on delete cascade,
	review_state text not null check (review_state in ('right', 'not_right')),
	what_is_wrong text check (what_is_wrong is null or char_length(what_is_wrong) between 1 and 1000),
	reviewed_by uuid references auth.users (id) on delete set null,
	reviewed_at timestamptz not null default now(),
	check ((review_state = 'not_right') = (what_is_wrong is not null))
);

create index if not exists workflow_map_station_reviews_latest
	on public.workflow_map_station_reviews (station_id, reviewed_at desc);

alter table public.workflow_map_station_reviews enable row level security;

create or replace function public.workflow_map_station_standings(target_organisation uuid, shown_stage text, shown_version integer)
returns table (station_key text, review_state text, what_is_wrong text, reviewed_at timestamptz, marked_on_version integer)
language sql
stable
set search_path to 'public'
as $$
	select distinct on (shown.station_key)
		shown.station_key, review.review_state, review.what_is_wrong, review.reviewed_at, earlier_version.version_number
	from public.workflow_map_versions shown_version_row
	join public.workflow_map_stations shown on shown.version_id = shown_version_row.id
	join public.workflow_map_lines shown_line on shown_line.id = shown.line_id
	join public.workflow_map_versions earlier_version
		on earlier_version.organisation_id = shown_version_row.organisation_id
		and earlier_version.stage = shown_version_row.stage
		and earlier_version.version_number <= shown_version_row.version_number
	join public.workflow_map_stations earlier
		on earlier.version_id = earlier_version.id and earlier.station_key = shown.station_key
	join public.workflow_map_lines earlier_line on earlier_line.id = earlier.line_id
	join public.workflow_map_station_reviews review on review.station_id = earlier.id
	where shown_version_row.organisation_id = target_organisation
		and shown_version_row.stage = shown_stage
		and shown_version_row.version_number = shown_version
		and (
			earlier.id = shown.id
			or (
				earlier_line.line_key = shown_line.line_key
				and earlier.name = shown.name
				and earlier.summary = shown.summary
				and earlier.takes_in = shown.takes_in
				and earlier.produces = shown.produces
				and earlier.done_in is not distinct from shown.done_in
				and earlier.is_output = shown.is_output
				and earlier.state = shown.state
				and earlier.product_id is not distinct from shown.product_id
			)
		)
	order by shown.station_key, review.reviewed_at desc, earlier_version.version_number desc
$$;

revoke execute on function public.workflow_map_station_standings(uuid, text, integer) from public, anon, authenticated;

commit;

notify pgrst, 'reload schema';
