-- 0285: a client reads, comments on and signs their contract pack in the portal.
--
-- James, task 8459f5c1, point 4: "In the client portal they read each
-- document, comment on a clause, and accept and sign it with name, position,
-- date and a confirmation that they are authorised to sign."
--
--   contract_packs.viewed_at        when a client contact first opened the pack
--                                   in the portal, which moves it to viewed.
--   contract_pack_comments          a client contact's comment on a clause of
--                                   one document of the pack, for YBT to read.
--   contract_pack_signatures        a client contact's signature on one
--                                   document, kept against the exact version
--                                   they read: their name, position, the date
--                                   they sign and that they are authorised to.
--
-- A client contact is not on the organisation, so the portal reads and writes
-- these with the service key, after checking the pack belongs to the client the
-- contact is at. Staff read and keep them as they do the pack; anyone who
-- reaches the organisation reads them.
--
-- Adds only: one column that is empty until a client opens a pack, and two new
-- tables. Nothing is dropped and no row is updated. Safe to re-run.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '1min';

alter table public.contract_packs add column if not exists viewed_at timestamptz;

create table if not exists public.contract_pack_comments (
	id uuid primary key default gen_random_uuid(),
	pack_id uuid not null references public.contract_packs (id) on delete cascade,
	document_id uuid not null references public.project_documents (id) on delete cascade,
	clause text not null default '' check (char_length(clause) <= 80),
	comment text not null check (char_length(comment) between 1 and 4000),
	contact_id uuid references public.client_contacts (id) on delete set null,
	made_by uuid references auth.users (id) on delete set null,
	made_at timestamptz not null default now()
);

create index if not exists contract_pack_comments_by_pack on public.contract_pack_comments (pack_id, made_at);

create table if not exists public.contract_pack_signatures (
	id uuid primary key default gen_random_uuid(),
	pack_id uuid not null references public.contract_packs (id) on delete cascade,
	document_id uuid not null references public.project_documents (id) on delete cascade,
	version_number integer not null check (version_number between 1 and 9999),
	signer_name text not null check (char_length(signer_name) between 1 and 120),
	signer_position text not null check (char_length(signer_position) between 1 and 120),
	signed_on date not null,
	is_authorised_to_sign boolean not null check (is_authorised_to_sign),
	contact_id uuid references public.client_contacts (id) on delete set null,
	signed_by uuid references auth.users (id) on delete set null,
	signed_at timestamptz not null default now(),
	unique (pack_id, document_id)
);

alter table public.contract_pack_comments enable row level security;
alter table public.contract_pack_signatures enable row level security;

drop policy if exists "people on an organisation read its contract pack comments" on public.contract_pack_comments;
create policy "people on an organisation read its contract pack comments" on public.contract_pack_comments
	for select using (
		exists (
			select 1 from public.contract_packs pack
			where pack.id = pack_id
				and (public.is_administrator() or coalesce(public.can_reach_organisation(pack.organisation_id), false))
		)
	);

drop policy if exists "staff keep contract pack comments" on public.contract_pack_comments;
create policy "staff keep contract pack comments" on public.contract_pack_comments
	for all using (public.is_administrator()) with check (public.is_administrator());

drop policy if exists "people on an organisation read its contract pack signatures" on public.contract_pack_signatures;
create policy "people on an organisation read its contract pack signatures" on public.contract_pack_signatures
	for select using (
		exists (
			select 1 from public.contract_packs pack
			where pack.id = pack_id
				and (public.is_administrator() or coalesce(public.can_reach_organisation(pack.organisation_id), false))
		)
	);

drop policy if exists "staff keep contract pack signatures" on public.contract_pack_signatures;
create policy "staff keep contract pack signatures" on public.contract_pack_signatures
	for all using (public.is_administrator()) with check (public.is_administrator());

commit;

notify pgrst, 'reload schema';
