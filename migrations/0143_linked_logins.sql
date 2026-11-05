-- 0143: one person may sign in with more than one login, and is counted once.
--
-- On 5 Nov 2026 Jeremy's work sat under two YBT logins, so what he owed was
-- split across two lists and his Claude and the board told different stories.
-- A linked login names the person's main login: everything waiting on,
-- assigned to or promised by any of their logins is gathered into one answer
-- of what that person owes, and who to chase lists them once.
--
-- Read and written by the server only, so row level security is on with no
-- policy. Additive and safe to re-run; the code that reads it stands without it.

begin;

create table if not exists public.linked_logins (
	account_id uuid primary key references auth.users (id) on delete cascade,
	person_account_id uuid not null references auth.users (id) on delete cascade,
	linked_by uuid references auth.users (id) on delete set null,
	created_at timestamptz not null default now(),
	check (account_id <> person_account_id)
);

create index if not exists linked_logins_person_account_id_idx on public.linked_logins (person_account_id);

alter table public.linked_logins enable row level security;

commit;

notify pgrst, 'reload schema';
