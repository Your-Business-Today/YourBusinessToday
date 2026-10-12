-- 0082: a sector is claimed before it is searched, so two people in two
-- cities never tread on the same ground. One claim per sector per patch,
-- held by the person who made it until they mark the sector searched,
-- release it, or hand it to a colleague. Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

create table if not exists public.sector_claims (
	patch_id uuid not null references public.patches (id) on delete cascade,
	sector text not null,
	claimed_by_account_id uuid not null references public.profiles (id) on delete cascade,
	claimed_at timestamptz not null default now(),
	primary key (patch_id, sector)
);

alter table public.sector_claims enable row level security;

drop policy if exists "project managers manage sector claims" on public.sector_claims;
create policy "project managers manage sector claims" on public.sector_claims
	for all using (public.is_project_manager()) with check (public.is_project_manager());

commit;

notify pgrst, 'reload schema';
