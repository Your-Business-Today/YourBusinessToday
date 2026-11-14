-- 0233: a brand's video is made on request, and the request is kept until the video is in its library.
--
-- Someone asks, from chat or the piece's page, for a video piece to be made into
-- its MP4. Your Business Today calls no AI model: the film is made by code on
-- GitHub's runner, which asks the site what to film, films it and sends the MP4
-- to the brand's library. Each request is one row:
--
--   brand_film_makings.state              waiting (asked for), filming (the
--                                         runner has it), ready (the video is
--                                         in the library) or failed
--   brand_film_makings.failure_reason     why it failed, said in words
--   brand_film_makings.filming_token_hash the hash of the token that opens the
--                                         film's page while it is filmed, and
--                                         only then
--   brand_film_makings.library_item_id    the library item the video is sent
--                                         to, granted when filming starts and
--                                         kept once the video arrives
--
-- A piece has at most one request waiting or filming at a time. People with
-- Brand read the requests and ask for one under their own name; only the site's
-- service moves one on, as only it hears from the runner.
--
-- Additive and safe to re-run: nothing is dropped or rewritten.

begin;

create table if not exists public.brand_film_makings (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	content_piece_id uuid not null,
	asked_by uuid references auth.users (id) on delete set null,
	state text not null default 'waiting' check (state in ('waiting', 'filming', 'ready', 'failed')),
	failure_reason text check (char_length(failure_reason) between 1 and 500),
	filming_token_hash text,
	library_item_id uuid references public.brand_library_items (id) on delete restrict,
	asked_at timestamptz not null default now(),
	started_at timestamptz,
	finished_at timestamptz,
	foreign key (content_piece_id, organisation_id)
		references public.brand_content_pieces (id, organisation_id) on delete restrict,
	check ((state = 'failed') = (failure_reason is not null)),
	check (state <> 'ready' or library_item_id is not null)
);

create unique index if not exists brand_film_makings_one_open_per_piece
	on public.brand_film_makings (content_piece_id) where state in ('waiting', 'filming');
create unique index if not exists brand_film_makings_by_filming_token
	on public.brand_film_makings (filming_token_hash) where filming_token_hash is not null;
create index if not exists brand_film_makings_by_piece
	on public.brand_film_makings (content_piece_id, asked_at desc);

alter table public.brand_film_makings enable row level security;

drop policy if exists "people with brand read its film makings" on public.brand_film_makings;
create policy "people with brand read its film makings" on public.brand_film_makings
	for select using (public.can_use_organisation_module(organisation_id, 'brand'));

drop policy if exists "people with brand ask for a film to be made" on public.brand_film_makings;
create policy "people with brand ask for a film to be made" on public.brand_film_makings
	for insert with check (
		public.can_use_organisation_module(organisation_id, 'brand')
		and asked_by = auth.uid()
		and state = 'waiting'
	);

commit;

notify pgrst, 'reload schema';
