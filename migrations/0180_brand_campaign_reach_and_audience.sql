-- 0180: a paid campaign's impressions, reach and the audience it reached.
--
-- The page on one paid campaign shows what was spent, how many people saw it,
-- how many clicked, what a click cost and who they were. The readings of 0179
-- carry the spend and the clicks; this adds what they lack:
--
--   brand_performance_readings   two counts more on every reading, as the
--                                platform gives them: impressions (the times it
--                                was shown) and reach (the people who saw it)
--   brand_campaign_audiences     the people a campaign reached on the day the
--                                platform's breakdown was read, by age band and
--                                gender, with the impressions, clicks and spend
--                                of each band
--
-- The new counts start at nought on the readings already held, so every reading
-- kept before this keeps its figures as they were. No figure is ever below
-- zero, a count's top is the integer column's, and spend's top is the largest
-- amount the books keep, in pence, as a reading's spend is (0179), so the door
-- and the column hold the same limit.
--
-- The age bands and the genders are the ones the ad platforms report, with
-- unknown for the people a platform cannot place. A breakdown is kept once for a
-- campaign, day, age band and gender: a later reading is a later day, so the
-- breakdowns already held are never overwritten.
--
-- The name brand_campaign_audiences was never used in this database, and the
-- guard below stops the migration if a table of that name is already there in
-- another shape, rather than let create table if not exists pass over it.
--
-- Every row carries the organisation it belongs to, and its link to the campaign
-- includes it, so an audience is only ever for the brand's own campaign. Nothing
-- here is deleted by a cascade: a brand or a campaign with an audience cannot be
-- deleted. A person reaches a brand's audiences only through
-- can_use_organisation_module(organisation, 'brand') from 0145.
--
-- Additive and safe to re-run.

begin;

do $$
begin
	if to_regclass('public.brand_campaign_audiences') is not null and not exists (
		select 1 from information_schema.columns
		where table_schema = 'public' and table_name = 'brand_campaign_audiences' and column_name = 'organisation_id'
	) then
		raise exception 'public.brand_campaign_audiences already exists in another shape; nothing was created';
	end if;
end;
$$;

alter table public.brand_performance_readings
	add column if not exists impressions integer not null default 0 check (impressions >= 0);
alter table public.brand_performance_readings
	add column if not exists reach integer not null default 0 check (reach >= 0);

create table if not exists public.brand_campaign_audiences (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.brand_kits (organisation_id) on delete restrict,
	campaign_id uuid not null,
	observed_on date not null,
	age_band text not null check (age_band in ('13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+', 'unknown')),
	gender text not null check (gender in ('female', 'male', 'unknown')),
	reach integer not null default 0 check (reach >= 0),
	impressions integer not null default 0 check (impressions >= 0),
	clicks integer not null default 0 check (clicks >= 0),
	spend_pence bigint not null default 0 check (spend_pence between 0 and 999999999999),
	recorded_by uuid references auth.users (id) on delete set null,
	created_at timestamptz not null default now(),
	unique (campaign_id, observed_on, age_band, gender),
	foreign key (campaign_id, organisation_id)
		references public.brand_campaigns (id, organisation_id) on delete restrict
);

create index if not exists brand_campaign_audiences_organisation_idx
	on public.brand_campaign_audiences (organisation_id);
create index if not exists brand_campaign_audiences_campaign_idx
	on public.brand_campaign_audiences (campaign_id, observed_on desc);

alter table public.brand_campaign_audiences enable row level security;

drop policy if exists "people with brand keep its campaign audiences" on public.brand_campaign_audiences;
create policy "people with brand keep its campaign audiences" on public.brand_campaign_audiences
	for all using (public.can_use_organisation_module(organisation_id, 'brand'))
	with check (public.can_use_organisation_module(organisation_id, 'brand'));

commit;

notify pgrst, 'reload schema';
