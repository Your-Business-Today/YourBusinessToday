-- 0270: every account accepts the current terms of service before it uses the site.
--
-- The terms say that everything generated on the site, by a person or by their
-- Claude, is their own use of software and never a professional service, and
-- that they review the skills behind what is generated. Nobody uses the site
-- until they have accepted the version in force, and a new version is accepted
-- again. So each acceptance is kept:
--
--   terms_acceptances   one account's acceptance of one version of the terms:
--                       the version (the date it was published, as
--                       src/lib/data/termsVersion.ts names it) and when it was
--                       accepted. An account accepts a version once.
--
-- A person reads and records only their own acceptances. Nothing updates or
-- deletes a row, so the record shows what each account agreed to and when.
-- Rows go with their account.
--
-- Additive and safe to re-run.

begin;

create table if not exists public.terms_acceptances (
	account_id uuid not null references auth.users (id) on delete cascade,
	terms_version text not null check (terms_version ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
	accepted_at timestamptz not null default now(),
	primary key (account_id, terms_version)
);

alter table public.terms_acceptances enable row level security;

drop policy if exists "A person reads their own terms acceptances" on public.terms_acceptances;
create policy "A person reads their own terms acceptances"
	on public.terms_acceptances for select
	to authenticated
	using (account_id = auth.uid());

drop policy if exists "A person records their own terms acceptance" on public.terms_acceptances;
create policy "A person records their own terms acceptance"
	on public.terms_acceptances for insert
	to authenticated
	with check (account_id = auth.uid());

grant select, insert on public.terms_acceptances to authenticated;

commit;
