-- 0152: a company's job adverts are kept on its client record.
--
-- Until now the job adverts panel and read_company_job_adverts searched the job
-- boards through Anthropic with YBT's own key, and nothing was kept: each look
-- searched again. Now a staff member's own Claude searches the boards and sends
-- what it found with save_company_job_adverts, and each advert is kept here, one
-- row per advert page on each client. Sending a page already kept adds nothing
-- and changes nothing, so the first reading of an advert stands.
--
-- The limits mirror src/lib/data/jobAdvertRules.ts, which the connector checks
-- before anything is written.
--
-- Adds only: a new table, nothing existing is changed. Safe to re-run.

begin;

create table if not exists public.client_job_adverts (
	id uuid primary key default gen_random_uuid(),
	client_id uuid not null references public.clients (id) on delete cascade,
	title text not null check (char_length(title) between 1 and 200),
	url text not null check (char_length(url) between 1 and 2000),
	posted_on date,
	found_at timestamptz not null default now(),
	found_by_account_id uuid references auth.users (id) on delete set null,
	unique (client_id, url)
);

create index if not exists client_job_adverts_by_client on public.client_job_adverts (client_id, found_at desc);

alter table public.client_job_adverts enable row level security;

drop policy if exists "project managers manage client job adverts" on public.client_job_adverts;
create policy "project managers manage client job adverts" on public.client_job_adverts
	for all using (public.is_project_manager()) with check (public.is_project_manager());

commit;

notify pgrst, 'reload schema';
