-- 0126: each prospect who opens the demo link gets a private copy of the
-- made-up business, held whole as one document under a token only they hold.
--
-- The table stands alone: no reference to any client, project or account, so
-- nothing a prospect's Claude asks of the demo can reach a real record. Row
-- level security is on with no policy, so only the service role reads it.
--
-- Additive and safe to re-run.

begin;

create table if not exists public.demo_businesses (
	token text primary key check (token ~ '^[0-9a-f]{24}$'),
	business jsonb not null,
	created_at timestamptz not null default now(),
	last_used_at timestamptz not null default now()
);

alter table public.demo_businesses enable row level security;

commit;

notify pgrst, 'reload schema';
