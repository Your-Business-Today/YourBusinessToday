-- 0226: the books remember who is always what, as a rule for each counterparty on the bank statement.
--
-- A rule says what a bank line from one counterparty always is, so the person's Claude matches it once and the books
-- match the next month's lines by themselves: a cost on an expense account (a software subscription), or money moving
-- to or from another account (a director's loan account). A rule never matches a line to an invoice: a customer's
-- payment is matched by the person's Claude, which reads the reference.
--
-- The counterparty is matched whole, ignoring case and the spaces at its ends, as counterparty_key holds it. A rule
-- covers money in, money out, or either; one rule for a counterparty and direction. matched_as is cost or account;
-- account_id is the expense account of a cost or the other account of a movement. A cost centre is kept for a cost
-- only. A rule is applied through 0223's match, unchanged, so a line matched by a rule is matched as it would be by hand.
--
-- The connector checks every value against these columns first (bankRuleRules.ts states the same limits); the checks
-- here are the backstop. Read and written by the server only, after the books module check, so row level security is
-- on with no policy. A new table: nothing here alters, drops or copies from an existing table, and no row elsewhere is
-- changed. Additive and safe to re-run; nothing reads it until the code that does is deployed.

begin;

create table if not exists public.books_bank_rules (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	counterparty text not null check (char_length(counterparty) between 1 and 200),
	counterparty_key text generated always as (lower(btrim(counterparty))) stored,
	direction text not null check (direction in ('in', 'out', 'either')),
	matched_as text not null check (matched_as in ('cost', 'account')),
	account_id uuid not null,
	description text not null default '' check (char_length(description) <= 300),
	cost_centre_id uuid,
	set_by_account_id uuid not null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (organisation_id, id),
	constraint books_bank_rules_one_per_counterparty_and_direction unique (organisation_id, counterparty_key, direction),
	constraint books_bank_rules_cost_is_money_out check (matched_as <> 'cost' or direction = 'out'),
	constraint books_bank_rules_movement_is_described check (matched_as <> 'account' or btrim(description) <> ''),
	constraint books_bank_rules_cost_centre_for_a_cost check (matched_as = 'cost' or cost_centre_id is null),
	foreign key (organisation_id, account_id)
		references public.books_ledger_accounts (organisation_id, id) on delete cascade,
	foreign key (organisation_id, cost_centre_id)
		references public.books_cost_centres (organisation_id, id) on delete set null (cost_centre_id)
);

alter table public.books_bank_rules enable row level security;

commit;

notify pgrst, 'reload schema';
