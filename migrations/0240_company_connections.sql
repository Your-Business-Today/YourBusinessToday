-- 0240: who is behind a company, as the public record links it.
--
-- read_company_connections finds, for any UK company, the companies that own over
-- 25% of it and each current director's other active companies, marking those the
-- director also owns over 25% of. company_connection_checks keeps one row per
-- company looked at, with when and the officers left out by name (more than 25
-- current appointments: formation agents and nominees), so a company with no
-- connection is still known to be checked. company_connections keeps one row per
-- connection found. A company's rows are read again once they are older than the
-- number of days src/lib/data/connectionRules.ts states. No birth date is stored.
--
-- The limits mirror src/lib/data/connectionRules.ts, which the door checks before
-- anything is written.
--
-- Adds only: two new tables, nothing existing is changed. Safe to re-run.

begin;

create table if not exists public.company_connection_checks (
	company_number text primary key check (company_number ~ '^[A-Z0-9]{8}$'),
	left_out_officers text[] not null default '{}' check (cardinality(left_out_officers) <= 100),
	checked_at timestamptz not null default now()
);

create table if not exists public.company_connections (
	company_number text not null references public.company_connection_checks (company_number) on delete cascade,
	connected_company_number text not null check (connected_company_number ~ '^[A-Z0-9]{8}$'),
	connected_company_name text not null default '' check (char_length(connected_company_name) <= 200),
	kind text not null check (kind in ('director_owns', 'director_sits', 'owns_this_company')),
	through_name text not null default '' check (char_length(through_name) <= 200),
	primary key (company_number, connected_company_number, kind, through_name)
);

create index if not exists company_connections_by_connected on public.company_connections (connected_company_number);

alter table public.company_connection_checks enable row level security;
alter table public.company_connections enable row level security;

drop policy if exists "project managers manage company connection checks" on public.company_connection_checks;
create policy "project managers manage company connection checks" on public.company_connection_checks
	for all using (public.is_project_manager()) with check (public.is_project_manager());

drop policy if exists "project managers manage company connections" on public.company_connections;
create policy "project managers manage company connections" on public.company_connections
	for all using (public.is_project_manager()) with check (public.is_project_manager());

commit;

notify pgrst, 'reload schema';
