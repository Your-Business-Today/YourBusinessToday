-- 0191: a planned post says what picture it needs and carries the ones chosen from the library.
--
-- Jewel's plan has two columns for it on every row, "Photo needed" and "Where to
-- get the photo", and a row is a post (brand_content_posts, 0188) that goes out
-- on several channels. So the picture is said once for the post and shown on
-- every one of its channels:
--
--   brand_content_posts.picture_needed         in words, the photo or video the
--                                              post needs; empty while nobody
--                                              has said
--   brand_content_posts.picture_expected_from  where it is expected to come
--                                              from: the team on a job, the
--                                              website's portfolio, a stock
--                                              picture
--   brand_content_post_pictures                one photo or video from the
--                                              brand's library (0184) chosen for
--                                              a post, with who chose it and when
--
-- Whether an item may go in a post is the library's own rule
-- (src/lib/brand/library/), read by the code that chooses it, never stored here.
-- An item and the post it is chosen for belong to the same organisation, so the
-- link names both, and a unique index on the library's (id, organisation_id)
-- lets it say so; the library's rows are left as they are.
--
-- Nothing takes a picture off a post: the link has no delete or update policy,
-- and nothing here is deleted by a cascade. A post, or an item, chosen once
-- cannot be deleted while the link stands.
--
-- The link table's name was never used in this database, and the guard below
-- stops the migration if a table of that name is already there in another
-- shape. A person reaches a post's pictures only through
-- can_use_organisation_module(organisation, 'brand') from 0145.
--
-- Additive and safe to re-run.

begin;

do $$
begin
	if to_regclass('public.brand_content_post_pictures') is not null and not exists (
		select 1 from information_schema.columns
		where table_schema = 'public' and table_name = 'brand_content_post_pictures' and column_name = 'library_item_id'
	) then
		raise exception 'public.brand_content_post_pictures already exists in another shape; nothing was created';
	end if;
end;
$$;

alter table public.brand_content_posts
	add column if not exists picture_needed text check (char_length(picture_needed) between 1 and 500),
	add column if not exists picture_expected_from text check (char_length(picture_expected_from) between 1 and 200);

create unique index if not exists brand_library_items_id_organisation
	on public.brand_library_items (id, organisation_id);

create table if not exists public.brand_content_post_pictures (
	id uuid primary key default gen_random_uuid(),
	post_id uuid not null,
	organisation_id uuid not null,
	library_item_id uuid not null,
	chosen_by uuid references auth.users (id) on delete set null,
	chosen_at timestamptz not null default now(),
	unique (post_id, library_item_id),
	foreign key (post_id, organisation_id)
		references public.brand_content_posts (id, organisation_id) on delete restrict,
	foreign key (library_item_id, organisation_id)
		references public.brand_library_items (id, organisation_id) on delete restrict
);

create index if not exists brand_content_post_pictures_by_item
	on public.brand_content_post_pictures (library_item_id);

alter table public.brand_content_post_pictures enable row level security;

drop policy if exists "people with brand read the pictures of its posts" on public.brand_content_post_pictures;
create policy "people with brand read the pictures of its posts" on public.brand_content_post_pictures
	for select using (public.can_use_organisation_module(organisation_id, 'brand'));

drop policy if exists "people with brand choose pictures for its posts" on public.brand_content_post_pictures;
create policy "people with brand choose pictures for its posts" on public.brand_content_post_pictures
	for insert with check (public.can_use_organisation_module(organisation_id, 'brand'));

commit;

notify pgrst, 'reload schema';
