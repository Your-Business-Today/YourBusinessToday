-- 0241: a staff member's screen of a territory for companies with cash.
--
-- start_cash_screen records one row here: the territory, what it is narrowed by
-- (a postcode sector, a SIC code), the least cash at bank a company needs, who
-- started it and when. The cash_screens watcher works through the territory's
-- companies in company-number order, reading each one's accounts and, when its
-- own cash falls short, who is behind it, and keeps where it got to here so a run
-- cut off part way carries on. What each company comes out as is worked out when
-- the screen is read, from the readings in company_accounts_readings and
-- company_connections, and is never stored.
--
-- The limits mirror src/lib/data/cashScreenRules.ts, which the door checks before
-- anything is written.
--
-- Adds only: a new table, nothing existing is changed. Safe to re-run.

begin;

create table if not exists public.cash_screens (
	id uuid primary key default gen_random_uuid(),
	patch_id uuid not null references public.patches (id) on delete cascade,
	sector text not null default '' check (char_length(sector) <= 10),
	sic_code text not null default '' check (sic_code ~ '^[0-9]{0,5}$'),
	least_cash numeric not null check (least_cash >= 1 and least_cash <= 99999999999999 and least_cash = trunc(least_cash)),
	started_by_account_id uuid references auth.users (id) on delete set null,
	started_at timestamptz not null default now(),
	resume_after text not null default '' check (char_length(resume_after) <= 8),
	companies_done integer not null default 0 check (companies_done >= 0),
	finished_at timestamptz
);

create index if not exists cash_screens_unfinished on public.cash_screens (started_at) where finished_at is null;

alter table public.cash_screens enable row level security;

drop policy if exists "project managers manage cash screens" on public.cash_screens;
create policy "project managers manage cash screens" on public.cash_screens
	for all using (public.is_project_manager()) with check (public.is_project_manager());

commit;

notify pgrst, 'reload schema';
