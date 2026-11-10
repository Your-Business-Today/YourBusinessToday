-- 0188: one post goes out on several channels, each with its own version.
--
-- A piece of a brand's content (brand_content_pieces, 0168) is one row for one
-- medium, from idea to published, with its own caption, approval, schedule,
-- publication and snapshot of the brand at that medium. A post is the idea
-- they share, planned once: Jewel's plan sends every row out on Instagram and
-- Facebook, with the caption fitted to each. So a post is a row of its own,
-- and each channel it goes out on is one of its pieces:
--
--   brand_content_posts           a post of the brand's content
--   brand_content_post_channels   a piece as one channel's version of a post;
--                                 a piece is the version of one post only
--
-- Nothing on brand_content_pieces is dropped, renamed or rewritten, so the
-- campaigns (0177), the performance readings (0179), the client's review and
-- the month's plan read every piece as they do now. Approval, scheduling and
-- publication stay on the piece, so they are recorded for each channel, and a
-- review of a piece is already a review of that one channel.
--
-- Every piece already kept is copied into a post with one channel, whose id is
-- the piece's own, as the site does when it keeps a new piece. The copy skips
-- a piece already on a post, so running it twice copies nothing twice.
--
-- None of these names was ever used in this database, and the guard below
-- stops the migration if a table of one of these names is already there in
-- another shape. A person reaches a brand's posts only through
-- can_use_organisation_module(organisation, 'brand') from 0145.
--
-- Additive and safe to re-run.

begin;

do $$
declare
	post_table text;
begin
	foreach post_table in array array['brand_content_posts', 'brand_content_post_channels'] loop
		if to_regclass('public.' || post_table) is not null and not exists (
			select 1 from information_schema.columns
			where table_schema = 'public' and table_name = post_table and column_name = 'organisation_id'
		) then
			raise exception 'public.% already exists in another shape; nothing was created', post_table;
		end if;
	end loop;
end;
$$;

create table if not exists public.brand_content_posts (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.brand_kits (organisation_id) on delete restrict,
	created_by uuid references auth.users (id) on delete set null,
	created_at timestamptz not null default now(),
	unique (id, organisation_id)
);

create table if not exists public.brand_content_post_channels (
	content_piece_id uuid primary key,
	post_id uuid not null,
	organisation_id uuid not null,
	created_at timestamptz not null default now(),
	foreign key (post_id, organisation_id)
		references public.brand_content_posts (id, organisation_id) on delete restrict,
	foreign key (content_piece_id, organisation_id)
		references public.brand_content_pieces (id, organisation_id) on delete restrict
);

create index if not exists brand_content_post_channels_post_idx
	on public.brand_content_post_channels (post_id);

alter table public.brand_content_posts enable row level security;
alter table public.brand_content_post_channels enable row level security;

drop policy if exists "people with brand keep its posts" on public.brand_content_posts;
create policy "people with brand keep its posts" on public.brand_content_posts
	for all using (public.can_use_organisation_module(organisation_id, 'brand'))
	with check (public.can_use_organisation_module(organisation_id, 'brand'));

drop policy if exists "people with brand keep its post channels" on public.brand_content_post_channels;
create policy "people with brand keep its post channels" on public.brand_content_post_channels
	for all using (public.can_use_organisation_module(organisation_id, 'brand'))
	with check (public.can_use_organisation_module(organisation_id, 'brand'));

insert into public.brand_content_posts (id, organisation_id, created_by, created_at)
select piece.id, piece.organisation_id, piece.created_by, piece.created_at
from public.brand_content_pieces piece
where not exists (
	select 1 from public.brand_content_post_channels channel where channel.content_piece_id = piece.id
)
on conflict (id) do nothing;

insert into public.brand_content_post_channels (content_piece_id, post_id, organisation_id, created_at)
select piece.id, piece.id, piece.organisation_id, piece.created_at
from public.brand_content_pieces piece
on conflict (content_piece_id) do nothing;

commit;

notify pgrst, 'reload schema';
