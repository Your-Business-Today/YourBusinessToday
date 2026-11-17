-- 0264: Business News joins the modules an administrator switches on for an
-- organisation, and each organisation keeps the list of what it watches.
--
-- The module column's check (0145, widened by 0202) now accepts 'news'. No
-- module row is written, so Business News starts off for every organisation.
-- The check is found by what it guards and put back under one name, as 0202
-- did, so the file is safe to run twice.
--
-- news_watch_list holds one row per thing an organisation watches: a sector
-- code (a five figure SIC code, or an eight figure CPV code with or without
-- its check digit), a regulator or gov.uk topic, a word from its Domain, or a
-- company by its Companies House number. The value is kept as written, the
-- label is what the thing is called (the company's name, the regulator's), and
-- who added it and when are kept beside it. One thing is watched once.
--
-- The limits mirror src/lib/data/news/watchListRules.ts, which the site and the
-- connector check before anything is written.
--
-- That organisation's people read its list, once Business News is on, by the
-- one module rule; only staff add or remove. Adds only: one new table and a
-- widened check. Nothing that exists is altered otherwise and no row is
-- updated. The foreign key to organisations takes a short lock on it, so the
-- lock timeout gives up in seconds rather than queue the live site behind it.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '1min';

do $$
declare
	module_check record;
begin
	for module_check in
		select constraint_row.conname
		from pg_constraint constraint_row
		where constraint_row.conrelid = 'public.organisation_modules'::regclass
			and constraint_row.contype = 'c'
			and pg_get_constraintdef(constraint_row.oid) like '%module%'
	loop
		execute format('alter table public.organisation_modules drop constraint %I', module_check.conname);
	end loop;
end
$$;

alter table public.organisation_modules
	add constraint organisation_modules_module_check
	check (module in ('books', 'brand', 'business_brain', 'boardroom', 'sales', 'news'));

create table if not exists public.news_watch_list (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete cascade,
	kind text not null check (kind in ('sector_code', 'regulator_or_topic', 'word', 'company')),
	value text not null check (char_length(value) between 1 and 120),
	label text not null default '' check (char_length(label) <= 160),
	added_by uuid references auth.users (id) on delete set null,
	added_at timestamptz not null default now(),
	check (kind <> 'sector_code' or value ~ '^([0-9]{5}|[0-9]{8}(-[0-9])?)$'),
	check (kind <> 'company' or value ~ '^[A-Z0-9]{8}$'),
	unique (organisation_id, kind, value)
);

alter table public.news_watch_list enable row level security;

drop policy if exists "people read the news watch list of their organisations" on public.news_watch_list;
create policy "people read the news watch list of their organisations" on public.news_watch_list
	for select using (public.can_use_organisation_module(organisation_id, 'news'));

drop policy if exists "staff keep the news watch list" on public.news_watch_list;
create policy "staff keep the news watch list" on public.news_watch_list
	for all using (public.is_project_manager()) with check (public.is_project_manager());

commit;

notify pgrst, 'reload schema';
