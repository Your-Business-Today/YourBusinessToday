-- 0177: a brand's campaigns and the pieces in each sit in YBT's own tables.
--
-- The campaigns of yourbrand.today (Your-Business-Today/YourBrandToday,
-- migrations/0003_brand_work.sql, campaigns and campaign_pieces) are folded in
-- as campaigns of each organisation's brand, in tables of their own:
--
--   brand_campaigns         a paid campaign towards one audience action, with
--                           its whole budget in pence, its dates and its status
--   brand_campaign_pieces   a piece of the brand's content put behind a campaign
--
-- Each column accepts every value yourbrand.today's columns accept, with the
-- same checks, so a copy is never refused for a row's shape: the budget is
-- never below zero, a campaign never ends before it starts, and its status is
-- planned, running, paused or ended. The budget's top is the largest amount the
-- books keep, in pence, so the door and the column hold the same limit.
--
-- None of these names was ever used in this database, and the guard below
-- stops the migration if a table of one of these names is already there in
-- another shape, rather than let create table if not exists pass over it.
--
-- Every row carries the organisation it belongs to, and the links between the
-- tables include it, so a campaign holds only its own brand's pieces. Nothing
-- here is deleted by a cascade: a brand, a campaign or a piece that a campaign
-- holds cannot be deleted. A person reaches a brand's campaigns only through
-- can_use_organisation_module(organisation, 'brand') from 0145. Nothing here
-- connects to an ad account.
--
-- Additive and safe to re-run.

begin;

do $$
declare
	campaign_table text;
begin
	foreach campaign_table in array array['brand_campaigns', 'brand_campaign_pieces'] loop
		if to_regclass('public.' || campaign_table) is not null and not exists (
			select 1 from information_schema.columns
			where table_schema = 'public' and table_name = campaign_table and column_name = 'organisation_id'
		) then
			raise exception 'public.% already exists in another shape; nothing was created', campaign_table;
		end if;
	end loop;
end;
$$;

create table if not exists public.brand_campaigns (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.brand_kits (organisation_id) on delete restrict,
	name text not null check (char_length(name) between 1 and 120),
	objective text not null check (char_length(objective) <= 40),
	budget_pence bigint not null check (budget_pence between 0 and 999999999999),
	starts_on date not null,
	ends_on date not null,
	status text not null default 'planned' check (status in ('planned', 'running', 'paused', 'ended')),
	created_by uuid references auth.users (id) on delete set null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	check (ends_on >= starts_on),
	unique (id, organisation_id)
);

create table if not exists public.brand_campaign_pieces (
	organisation_id uuid not null,
	campaign_id uuid not null,
	content_piece_id uuid not null,
	added_by uuid references auth.users (id) on delete set null,
	created_at timestamptz not null default now(),
	primary key (campaign_id, content_piece_id),
	foreign key (campaign_id, organisation_id)
		references public.brand_campaigns (id, organisation_id) on delete restrict,
	foreign key (content_piece_id, organisation_id)
		references public.brand_content_pieces (id, organisation_id) on delete restrict
);

create index if not exists brand_campaigns_organisation_idx
	on public.brand_campaigns (organisation_id, starts_on desc);
create index if not exists brand_campaign_pieces_piece_idx
	on public.brand_campaign_pieces (content_piece_id);

alter table public.brand_campaigns enable row level security;
alter table public.brand_campaign_pieces enable row level security;

drop policy if exists "people with brand keep its campaigns" on public.brand_campaigns;
create policy "people with brand keep its campaigns" on public.brand_campaigns
	for all using (public.can_use_organisation_module(organisation_id, 'brand'))
	with check (public.can_use_organisation_module(organisation_id, 'brand'));

drop policy if exists "people with brand keep its campaign pieces" on public.brand_campaign_pieces;
create policy "people with brand keep its campaign pieces" on public.brand_campaign_pieces
	for all using (public.can_use_organisation_module(organisation_id, 'brand'))
	with check (public.can_use_organisation_module(organisation_id, 'brand'));

commit;

notify pgrst, 'reload schema';
