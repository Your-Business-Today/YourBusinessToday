-- 0144: the YBT agent remembers where each person's conversation stands.
--
-- The agent raises one thing at a time, worked out fresh from the board, so a
-- conversation lands in the same place however and whenever it starts. Two
-- things cannot be read from the board and are kept here: when the person
-- last spoke with it and the last item it raised, and the items they put off
-- until a day of their choosing, so a new chat never re-asks what they just
-- put off.
--
-- Read and written by the server only, so row level security is on with no
-- policy. Additive and safe to re-run; the code that reads it stands without it.

begin;

create table if not exists public.agent_conversations (
	account_id uuid primary key references auth.users (id) on delete cascade,
	last_spoke_at timestamptz,
	last_item_key text check (last_item_key is null or char_length(last_item_key) <= 200)
);

create table if not exists public.agent_snoozes (
	account_id uuid not null references auth.users (id) on delete cascade,
	item_key text not null check (char_length(item_key) between 1 and 200),
	until_day date not null,
	created_at timestamptz not null default now(),
	primary key (account_id, item_key)
);

alter table public.agent_conversations enable row level security;
alter table public.agent_snoozes enable row level security;

commit;

notify pgrst, 'reload schema';
