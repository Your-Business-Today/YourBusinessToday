-- 0234: a brand's pictures are made on request, as its videos are (0233).
--
-- A piece whose medium is an image (a post, a story, a carousel) is made into
-- one PNG a shot: the library picture the shot carries, with its words drawn
-- where the shot says. The request is the same one a video makes, of another
-- kind, and it holds every picture it made:
--
--   brand_film_makings.kind             video (one MP4) or pictures (one PNG
--                                       a shot); every request made so far
--                                       was a video
--   brand_film_making_pictures          one row a picture: the request, the
--                                       shot it was made from, counted from
--                                       1, and the library item it went to
--
-- A request for pictures names its first picture as its library item, so a
-- finished request of either kind names what it made.
--
-- Additive and safe to re-run: nothing is dropped or rewritten.

begin;

alter table public.brand_film_makings
	add column if not exists kind text not null default 'video' check (kind in ('video', 'pictures'));

create table if not exists public.brand_film_making_pictures (
	film_making_id uuid not null references public.brand_film_makings (id) on delete restrict,
	organisation_id uuid not null,
	shot_number integer not null check (shot_number between 1 and 100),
	library_item_id uuid not null references public.brand_library_items (id) on delete restrict,
	primary key (film_making_id, shot_number)
);

alter table public.brand_film_making_pictures enable row level security;

drop policy if exists "people with brand read the pictures made for it" on public.brand_film_making_pictures;
create policy "people with brand read the pictures made for it" on public.brand_film_making_pictures
	for select using (public.can_use_organisation_module(organisation_id, 'brand'));

commit;

notify pgrst, 'reload schema';
