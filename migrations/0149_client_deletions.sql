-- 0149: the record of a client deleted from the register.
--
-- A client deleted as a duplicate or a mistake takes its ledger, its contacts
-- and their notes and links with it (on delete cascade), so the record of the
-- deletion lives here, where it outlives the client: who deleted it, when, and
-- a copy of the client row with everything that went with it, so nothing a
-- deletion removes is lost.
--
-- Written by the server only, so row level security is on with no policy.
-- Additive and safe to re-run. No foreign key to clients: the client is gone.

begin;

create table if not exists public.client_deletions (
	id uuid primary key default gen_random_uuid(),
	client_id uuid not null,
	client_name text not null,
	record jsonb not null,
	deleted_by_account_id uuid references auth.users (id) on delete set null,
	deleted_at timestamptz not null default now()
);

create index if not exists client_deletions_by_day on public.client_deletions (deleted_at desc);

alter table public.client_deletions enable row level security;

commit;

notify pgrst, 'reload schema';
