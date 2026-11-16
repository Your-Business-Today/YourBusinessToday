-- 0261: a quote on a lead, the plan going forwards a stage at a time with its fees.
--
-- James, 16 Nov 2026, for the Conservaqua meeting: "a plan going forwards" with
-- "some commercial stuff in there too, like quote essentially", kept "over mcp so
-- when im in the meeting i can feed information into claude". A quote is a title,
-- the day it was prepared, the day it stands until, an introduction, its lines in
-- order and its terms. A line is a stage or a running service: what it delivers,
-- when, and its fee, an amount on a basis (fixed, monthly or daily) or no amount
-- and a note. Each filing is the next numbered version for the company and never
-- changes one filed before, as a workflow map is filed. The latest is the quote.
--
-- The limits mirror src/lib/data/leadQuoteRules.ts, which the connector checks
-- before anything is written. Amounts are numeric(12, 2), as Books keeps them.
--
-- Adds only: two new tables and the function that files into them. Nothing that
-- exists is altered and no row is updated. The foreign key to clients takes a
-- short lock on it, so the lock timeout gives up in seconds rather than queue the
-- live site behind it (16 Nov 2026, 0254). Safe to re-run.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '1min';

create table if not exists public.lead_quotes (
	id uuid primary key default gen_random_uuid(),
	client_id uuid not null references public.clients (id) on delete cascade,
	version integer not null check (version >= 1),
	title text not null check (char_length(title) between 1 and 120),
	introduction text not null default '' check (char_length(introduction) <= 2000),
	terms text not null default '' check (char_length(terms) <= 2000),
	prepared_on date not null,
	valid_until date check (valid_until is null or valid_until >= prepared_on),
	filed_by_account_id uuid references auth.users (id) on delete set null,
	filed_at timestamptz not null default now(),
	unique (client_id, version)
);

create table if not exists public.lead_quote_lines (
	id uuid primary key default gen_random_uuid(),
	quote_id uuid not null references public.lead_quotes (id) on delete cascade,
	position integer not null check (position between 1 and 30),
	name text not null check (char_length(name) between 1 and 120),
	delivers text not null default '' check (char_length(delivers) <= 600),
	timing text not null default '' check (char_length(timing) <= 120),
	fee_basis text not null check (fee_basis in ('fixed', 'monthly', 'daily')),
	fee_amount numeric(12, 2) check (fee_amount is null or fee_amount >= 0),
	fee_note text not null default '' check (char_length(fee_note) <= 200),
	check (fee_amount is not null or char_length(fee_note) >= 1),
	unique (quote_id, position)
);

alter table public.lead_quotes enable row level security;
alter table public.lead_quote_lines enable row level security;

drop policy if exists "project managers manage lead quotes" on public.lead_quotes;
create policy "project managers manage lead quotes" on public.lead_quotes
	for all using (public.is_project_manager()) with check (public.is_project_manager());

drop policy if exists "project managers manage lead quote lines" on public.lead_quote_lines;
create policy "project managers manage lead quote lines" on public.lead_quote_lines
	for all using (public.is_project_manager()) with check (public.is_project_manager());

create or replace function public.file_lead_quote(target_client uuid, filer uuid, quote jsonb)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	new_quote_id uuid;
	new_version integer;
begin
	perform pg_advisory_xact_lock(hashtext('lead_quote:' || target_client::text));

	select coalesce(max(version), 0) + 1 into new_version
	from public.lead_quotes
	where client_id = target_client;

	insert into public.lead_quotes (client_id, version, title, introduction, terms, prepared_on, valid_until, filed_by_account_id)
	values (
		target_client, new_version, quote ->> 'title', coalesce(quote ->> 'introduction', ''),
		coalesce(quote ->> 'terms', ''), (quote ->> 'preparedOn')::date, (quote ->> 'validUntil')::date, filer
	)
	returning id into new_quote_id;

	insert into public.lead_quote_lines (quote_id, position, name, delivers, timing, fee_basis, fee_amount, fee_note)
	select new_quote_id, line_position, line ->> 'name', coalesce(line ->> 'delivers', ''), coalesce(line ->> 'timing', ''),
		line ->> 'feeBasis', (line ->> 'feeAmount')::numeric, coalesce(line ->> 'feeNote', '')
	from jsonb_array_elements(coalesce(quote -> 'lines', '[]'::jsonb)) with ordinality as line_entry(line, line_position);

	return new_version;
end;
$$;

revoke execute on function public.file_lead_quote(uuid, uuid, jsonb) from public, anon, authenticated;

commit;

notify pgrst, 'reload schema';
