-- 0292: a shared cost whose projects are chosen by their status, and the history of each project's status.
--
-- Asked for by James, 25 Nov 2026 (story 192e4473, task a06ec4f0): a cost such as
-- Vercel Pro or the Supabase Pro plan is shared by every project that is live,
-- so the split comes from a rule rather than from naming each project. A shared
-- cost whose members_by is 'live_projects' is shared, each month, by every
-- project of the organisation that was building, testing or in maintenance at
-- any time that month: a project put on hold or completed shares the month it
-- happened and leaves from the month after, and one moved into building joins
-- in the month it moved. 'named' keeps the members books_cost_share_members
-- names, as before.
--
-- project_status_changes keeps every change of a project's status from now on,
-- with the UK month it happened. A trigger writes it, so every door that moves a
-- status (the site, the connector, the agents) is kept without each having to.
-- Each project's status as this migration runs is kept as its starting status
-- (is_starting_status), which the months before the history began are read with.
-- A project made later starts its history in the month it was made.
--
-- Read and written by the server only, so row level security is on with no
-- policy; the trigger function is security definer so a person's own update of
-- a project can write it. One new table, one new column with a default, and a
-- trigger; no existing row is changed. Additive and safe to re-run; the code that
-- reads them stands without them.

begin;

set local lock_timeout = '10s';

alter table public.books_cost_shares
	add column if not exists members_by text not null default 'named' check (members_by in ('named', 'live_projects'));

create table if not exists public.project_status_changes (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid references public.organisations (id) on delete cascade,
	project_id uuid not null references public.projects (id) on delete cascade,
	status text not null,
	changed_month date not null check (extract(day from changed_month) = 1),
	is_starting_status boolean not null default false,
	changed_at timestamptz not null default now()
);

create index if not exists project_status_changes_by_project on public.project_status_changes (project_id, changed_at);
create index if not exists project_status_changes_by_organisation on public.project_status_changes (organisation_id);

alter table public.project_status_changes enable row level security;

insert into public.project_status_changes (organisation_id, project_id, status, changed_month, is_starting_status)
select project.organisation_id, project.id, project.status, date_trunc('month', now() at time zone 'Europe/London')::date, true
from public.projects project
where not exists (select 1 from public.project_status_changes kept where kept.project_id = project.id);

create or replace function public.keep_project_status_change()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if tg_op = 'UPDATE' and new.status is not distinct from old.status then
		return new;
	end if;
	insert into public.project_status_changes (organisation_id, project_id, status, changed_month)
	values (new.organisation_id, new.id, new.status, date_trunc('month', now() at time zone 'Europe/London')::date);
	return new;
end;
$$;

drop trigger if exists project_status_change_is_kept on public.projects;
create trigger project_status_change_is_kept
	after insert or update of status on public.projects
	for each row execute function public.keep_project_status_change();

commit;

notify pgrst, 'reload schema';
