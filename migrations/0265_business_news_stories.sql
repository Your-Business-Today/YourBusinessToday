-- 0265: the stories in an organisation's Business News, and each person's
-- marks on them.
--
-- news_stories holds one row per story an organisation's news carries: where
-- it came from (gov.uk, a tender, the Gazette, Companies House, or filed by a
-- client's own Claude), its headline, the link it was read at, the day it was
-- published when that is known, the watched thing it matched and why, and the
-- filing Claude's short note on why it matters. Only the headline, the link and
-- the note are kept, never the article's text. One story per organisation per
-- link, so the same story is never filed twice.
--
-- news_story_marks holds each person's mark on a story: when they first saw it
-- and whether they found it relevant or not. One mark per person per story.
--
-- The limits mirror src/lib/data/news/newsStoryRules.ts, which the connector
-- checks before anything is written.
--
-- That organisation's people read and file its stories once Business News is
-- on, by the one module rule, and keep their own marks; staff keep everything.
-- Adds only: two new tables and the function that finds what a person has not
-- seen. Nothing that exists is altered and no row is
-- updated. The foreign keys take a short lock on the tables they point at, so
-- the lock timeout gives up in seconds rather than queue the live site.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '1min';

create table if not exists public.news_stories (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete cascade,
	source text not null check (source in ('gov_uk', 'tender', 'gazette', 'companies_house', 'filed_by_claude')),
	headline text not null check (char_length(headline) between 1 and 300),
	link text not null check (char_length(link) between 1 and 2000 and link ~ '^https?://'),
	published_on date,
	watched_thing_id uuid references public.news_watch_list (id) on delete set null,
	match_reason text not null default '' check (char_length(match_reason) <= 300),
	note text not null default '' check (char_length(note) <= 500),
	filed_by uuid references auth.users (id) on delete set null,
	filed_at timestamptz not null default now(),
	unique (organisation_id, link)
);

create index if not exists news_stories_organisation_filed_at
	on public.news_stories (organisation_id, filed_at desc);

create table if not exists public.news_story_marks (
	story_id uuid not null references public.news_stories (id) on delete cascade,
	account_id uuid not null references auth.users (id) on delete cascade,
	seen_at timestamptz not null default now(),
	relevance text check (relevance in ('relevant', 'not_relevant')),
	marked_at timestamptz,
	primary key (story_id, account_id)
);

alter table public.news_stories enable row level security;
alter table public.news_story_marks enable row level security;

drop policy if exists "people read the news of their organisations" on public.news_stories;
create policy "people read the news of their organisations" on public.news_stories
	for select using (public.can_use_organisation_module(organisation_id, 'news'));

drop policy if exists "people file news for their organisations" on public.news_stories;
create policy "people file news for their organisations" on public.news_stories
	for insert with check (public.can_use_organisation_module(organisation_id, 'news') and filed_by = auth.uid());

drop policy if exists "staff keep the news" on public.news_stories;
create policy "staff keep the news" on public.news_stories
	for all using (public.is_project_manager()) with check (public.is_project_manager());

drop policy if exists "people keep their own marks on the news" on public.news_story_marks;
create policy "people keep their own marks on the news" on public.news_story_marks
	for all using (account_id = auth.uid())
	with check (account_id = auth.uid() and exists (select 1 from public.news_stories story where story.id = story_id));

drop policy if exists "staff keep the marks on the news" on public.news_story_marks;
create policy "staff keep the marks on the news" on public.news_story_marks
	for all using (public.is_project_manager()) with check (public.is_project_manager());

-- The stories of an organisation a person has no mark on yet, oldest first, so
-- a reading that stops at its limit is carried on by the next. The connector
-- calls it for the person asking and then marks what it handed back as seen.
create or replace function public.news_stories_unseen_by(organisation uuid, reader uuid, how_many integer)
returns setof public.news_stories
language sql
stable
security invoker
set search_path = public
as $$
	select story.*
	from public.news_stories story
	where story.organisation_id = organisation
		and not exists (
			select 1 from public.news_story_marks mark
			where mark.story_id = story.id and mark.account_id = reader
		)
	order by story.filed_at, story.id
	limit how_many;
$$;

revoke all on function public.news_stories_unseen_by(uuid, uuid, integer) from public, anon, authenticated;
grant execute on function public.news_stories_unseen_by(uuid, uuid, integer) to service_role;

commit;

notify pgrst, 'reload schema';
