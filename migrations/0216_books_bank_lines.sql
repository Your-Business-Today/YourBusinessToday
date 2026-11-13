-- 0216: an organisation's books hold its bank statement, line by line.
--
-- A person's Claude reads the bank's file and gives the books each line as the statement shows it: the day,
-- who the money came from or went to, the reference, the bank's own word for the kind of payment, the amount
-- (money in above zero, money out below, never zero) and the balance after it when the statement gives one.
-- The books keep it on the ledger account the statement is of, in the statement's order.
--
-- A statement brought in twice adds nothing: a line is the same line when its organisation, account, day,
-- counterparty, reference and amount are the same, and the unique key holds that. Two identical lines on one
-- day are both real (two coffees), so each carries its occurrence among them, 1 for the first and 2 for the
-- second, and the occurrence is part of the key.
--
-- matched_journal_id is the journal the line was matched to; matching is a later step, so every line starts
-- unmatched. A journal is matched by one line at most, and deleting it leaves the line unmatched.
--
-- The connector checks every value against these columns first (bankLineRules.ts states the same limits);
-- the checks here are the backstop. Read and written by the server only, after the books module check, so
-- row level security is on with no policy. Nothing here alters, drops or copies from an existing table.
-- Additive and safe to re-run; nothing reads it until the code that does is deployed.

begin;

create table if not exists public.books_bank_lines (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	bank_account_id uuid not null,
	line_date date not null,
	counterparty text not null check (char_length(counterparty) between 1 and 200),
	reference text not null default '' check (char_length(reference) <= 200),
	kind text not null default '' check (char_length(kind) <= 60),
	amount numeric(12, 2) not null check (amount <> 0),
	balance_after numeric(12, 2),
	position integer not null check (position >= 1),
	occurrence integer not null default 1 check (occurrence >= 1),
	matched_journal_id uuid,
	created_at timestamptz not null default now(),
	unique (organisation_id, id),
	constraint books_bank_lines_once_each
		unique (organisation_id, bank_account_id, line_date, counterparty, reference, amount, occurrence),
	constraint books_bank_lines_journal_matched_once unique (organisation_id, matched_journal_id),
	foreign key (organisation_id, bank_account_id)
		references public.books_ledger_accounts (organisation_id, id),
	foreign key (organisation_id, matched_journal_id)
		references public.books_journals (organisation_id, id) on delete set null (matched_journal_id)
);

create index if not exists books_bank_lines_in_statement_order
	on public.books_bank_lines (organisation_id, bank_account_id, line_date, created_at, position);

alter table public.books_bank_lines enable row level security;

commit;

notify pgrst, 'reload schema';
