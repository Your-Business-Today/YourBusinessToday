-- 0179: how a brand's pieces and campaigns performed sits in a table of YBT's own.
--
-- The performance readings of yourbrand.today (Your-Business-Today/YourBrandToday,
-- migrations/0003_brand_work.sql, performance_readings) are folded in as readings
-- of each organisation's brand, in a table of its own:
--
--   brand_performance_readings   the figures one medium reported for a piece or a
--                                campaign on one day, exactly as the platform gave
--                                them: views, watch time, likes, comments, shares,
--                                saves, clicks, conversions and spend in pence
--
-- Reach, impressions and the audience are added by the paid campaign page's own
-- step, so they are not made here.
--
-- Each column accepts every value yourbrand.today's columns accept, with the
-- same checks, so a copy is never refused for a row's shape: no figure is ever
-- below zero, and a reading may name a piece, a campaign, both or neither. The
-- door asks for a piece or a campaign; the column stays as open as the old one so
-- an old brand-wide reading can still be copied in. Spend's top is the largest
-- amount the books keep, in pence, as a campaign's budget is (0177), so the door
-- and the column hold the same limit.
--
-- The name was never used in this database, and the guard below stops the
-- migration if a table of that name is already there in another shape, rather
-- than let create table if not exists pass over it.
--
-- Every row carries the organisation it belongs to, and the links to a piece and
-- to a campaign include it, so a reading is only ever for the brand's own piece or
-- campaign. Nothing here is deleted by a cascade: a brand, a piece or a campaign
-- that has readings cannot be deleted. A person reaches a brand's readings only
-- through can_use_organisation_module(organisation, 'brand') from 0145.
--
-- Additive and safe to re-run.

begin;

do $$
begin
	if to_regclass('public.brand_performance_readings') is not null and not exists (
		select 1 from information_schema.columns
		where table_schema = 'public' and table_name = 'brand_performance_readings' and column_name = 'organisation_id'
	) then
		raise exception 'public.brand_performance_readings already exists in another shape; nothing was created';
	end if;
end;
$$;

create table if not exists public.brand_performance_readings (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.brand_kits (organisation_id) on delete restrict,
	content_piece_id uuid,
	campaign_id uuid,
	medium_path text not null check (char_length(medium_path) <= 60),
	observed_on date not null,
	views integer not null default 0 check (views >= 0),
	watch_seconds integer not null default 0 check (watch_seconds >= 0),
	likes integer not null default 0 check (likes >= 0),
	comments integer not null default 0 check (comments >= 0),
	shares integer not null default 0 check (shares >= 0),
	saves integer not null default 0 check (saves >= 0),
	clicks integer not null default 0 check (clicks >= 0),
	conversions integer not null default 0 check (conversions >= 0),
	spend_pence bigint not null default 0 check (spend_pence between 0 and 999999999999),
	recorded_by uuid references auth.users (id) on delete set null,
	created_at timestamptz not null default now(),
	foreign key (content_piece_id, organisation_id)
		references public.brand_content_pieces (id, organisation_id) on delete restrict,
	foreign key (campaign_id, organisation_id)
		references public.brand_campaigns (id, organisation_id) on delete restrict
);

create index if not exists brand_performance_readings_organisation_idx
	on public.brand_performance_readings (organisation_id, observed_on desc);
create index if not exists brand_performance_readings_piece_idx
	on public.brand_performance_readings (content_piece_id);
create index if not exists brand_performance_readings_campaign_idx
	on public.brand_performance_readings (campaign_id);

alter table public.brand_performance_readings enable row level security;

drop policy if exists "people with brand keep its performance readings" on public.brand_performance_readings;
create policy "people with brand keep its performance readings" on public.brand_performance_readings
	for all using (public.can_use_organisation_module(organisation_id, 'brand'))
	with check (public.can_use_organisation_module(organisation_id, 'brand'));

commit;

notify pgrst, 'reload schema';
