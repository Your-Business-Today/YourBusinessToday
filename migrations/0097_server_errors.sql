-- 0097: every server error a person sees is kept under the reference the
-- error page shows them, so an administrator (or their Claude, through the
-- connector) can look the reference up and read what failed. Written only by
-- the service key; read only by administrators. Safe to re-run.

begin;

create table if not exists public.server_errors (
	reference text primary key check (char_length(reference) between 1 and 40),
	occurred_at timestamptz not null default now(),
	route_id text,
	pathname text not null default '',
	method text not null default '',
	user_id uuid,
	status integer not null,
	message text not null default '',
	cause_message text not null default '',
	cause_stack text
);

create index if not exists server_errors_occurred_at on public.server_errors (occurred_at desc);

alter table public.server_errors enable row level security;

drop policy if exists "administrators read server errors" on public.server_errors;
create policy "administrators read server errors" on public.server_errors
	for select using (public.is_administrator());

commit;

notify pgrst, 'reload schema';
