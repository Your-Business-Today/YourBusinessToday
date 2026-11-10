-- 0168: a brand's content pieces and their reviews sit in YBT's own tables.
--
-- The content of yourbrand.today (Your-Business-Today/YourBrandToday,
-- migrations/0003_brand_work.sql, content_pieces and content_reviews) is
-- folded in as content of each organisation's brand, in tables of its own:
--
--   brand_content_pieces    a piece for one medium, from idea to published,
--                           with a snapshot of the brand as it held for that
--                           medium when the piece was drafted
--   brand_content_reviews   what a person said of a piece: a comment, a change
--                           asked for, or an approval
--
-- Each column accepts every value yourbrand.today's columns accept, with the
-- same checks, so a copy is never refused for a row's shape. The stage is
-- that table's status, named for what it is. The trend a piece rides is not
-- carried: trend watching comes later.
--
-- None of these names was ever used in this database, and the guard below
-- stops the migration if a table of one of these names is already there in
-- another shape, rather than let create table if not exists pass over it.
--
-- Every row carries the organisation it belongs to, and the links between the
-- tables include it. Nothing here is deleted by a cascade: a brand whose
-- content holds anything cannot be deleted. A person reaches a brand's content
-- only through can_use_organisation_module(organisation, 'brand') from 0145.
--
-- Additive and safe to re-run.

begin;

do $$
declare
	content_table text;
begin
	foreach content_table in array array['brand_content_pieces', 'brand_content_reviews'] loop
		if to_regclass('public.' || content_table) is not null and not exists (
			select 1 from information_schema.columns
			where table_schema = 'public' and table_name = content_table and column_name = 'organisation_id'
		) then
			raise exception 'public.% already exists in another shape; nothing was created', content_table;
		end if;
	end loop;
end;
$$;

create table if not exists public.brand_content_pieces (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.brand_kits (organisation_id) on delete restrict,
	medium_path text not null check (char_length(medium_path) <= 60),
	title text not null check (char_length(title) between 1 and 160),
	hook text not null default '' check (char_length(hook) <= 300),
	script text not null default '' check (char_length(script) <= 10000),
	storyboard jsonb not null default '[]' check (jsonb_typeof(storyboard) = 'array'),
	caption text not null default '' check (char_length(caption) <= 2200),
	invited_action text not null default '' check (char_length(invited_action) <= 40),
	stage text not null default 'drafted'
		check (stage in ('idea', 'drafted', 'awaiting_approval', 'approved', 'scheduled', 'published')),
	brand_snapshot jsonb not null default '{}' check (jsonb_typeof(brand_snapshot) = 'object'),
	scheduled_for timestamptz,
	published_url text not null default '' check (char_length(published_url) <= 500),
	created_by uuid references auth.users (id) on delete set null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (id, organisation_id)
);

create table if not exists public.brand_content_reviews (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	content_piece_id uuid not null,
	author_id uuid references auth.users (id) on delete set null,
	verdict text not null check (verdict in ('comment', 'changes_requested', 'approved')),
	body text not null default '' check (char_length(body) <= 2000),
	created_at timestamptz not null default now(),
	foreign key (content_piece_id, organisation_id)
		references public.brand_content_pieces (id, organisation_id) on delete restrict
);

create index if not exists brand_content_pieces_organisation_idx
	on public.brand_content_pieces (organisation_id, stage, updated_at desc);
create index if not exists brand_content_reviews_piece_idx
	on public.brand_content_reviews (content_piece_id, created_at);

alter table public.brand_content_pieces enable row level security;
alter table public.brand_content_reviews enable row level security;

drop policy if exists "people with brand keep its content" on public.brand_content_pieces;
create policy "people with brand keep its content" on public.brand_content_pieces
	for all using (public.can_use_organisation_module(organisation_id, 'brand'))
	with check (public.can_use_organisation_module(organisation_id, 'brand'));

drop policy if exists "people with brand keep its content reviews" on public.brand_content_reviews;
create policy "people with brand keep its content reviews" on public.brand_content_reviews
	for all using (public.can_use_organisation_module(organisation_id, 'brand'))
	with check (public.can_use_organisation_module(organisation_id, 'brand'));

commit;

notify pgrst, 'reload schema';
