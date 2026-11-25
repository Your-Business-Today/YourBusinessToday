-- 0284: a client's contract pack, prepared from the templates and kept on the
-- client's organisation.
--
-- James, task 8459f5c1: staff say through the connector "send the NDA, MSA,
-- Order Form and Schedules to ConservAqua to sign" and it happens inside YBT.
-- This first step prepares the pack: each chosen template is filled with the
-- client organisation's details and the lead's quote, with the optional
-- clauses chosen for this client, and kept as a written document on the
-- organisation (project_documents, 0282), so every version of the client's
-- copy is kept and the template never changes.
--
--   contract_packs             one pack for one client organisation: the
--                              clauses chosen, the quote version its fees came
--                              from, who prepared it and where it stands. A
--                              pack is drafted when prepared; the steps after
--                              (sending, the client reading, commenting and
--                              signing, YBT countersigning) move it on.
--   contract_pack_documents    the documents in a pack, each the organisation
--                              document it is kept as and the template it was
--                              made from, in the order they are read.
--
-- Staff prepare and move a pack; anyone who reaches the organisation reads it,
-- as they read its documents.
--
-- Adds only: two new tables. Nothing that exists is altered and no row is
-- updated. The foreign keys take a short lock on organisations and
-- project_documents, so the lock timeout gives up in seconds rather than queue
-- the live site behind it. Safe to re-run.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '1min';

create table if not exists public.contract_packs (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete cascade,
	stage text not null default 'drafted'
		check (stage in ('drafted', 'sent', 'viewed', 'commented', 'signed_by_client', 'countersigned')),
	chosen_clauses text[] not null default '{}' check (cardinality(chosen_clauses) <= 20),
	quote_version integer check (quote_version is null or quote_version >= 1),
	prepared_by uuid references auth.users (id) on delete set null,
	prepared_at timestamptz not null default now()
);

create index if not exists contract_packs_by_organisation
	on public.contract_packs (organisation_id, prepared_at desc);

create table if not exists public.contract_pack_documents (
	pack_id uuid not null references public.contract_packs (id) on delete cascade,
	document_id uuid not null references public.project_documents (id) on delete cascade,
	template_slug text not null check (char_length(template_slug) between 1 and 80),
	position integer not null check (position between 1 and 20),
	primary key (pack_id, document_id),
	unique (pack_id, position)
);

alter table public.contract_packs enable row level security;
alter table public.contract_pack_documents enable row level security;

drop policy if exists "people on an organisation read its contract packs" on public.contract_packs;
create policy "people on an organisation read its contract packs" on public.contract_packs
	for select using (public.is_administrator() or coalesce(public.can_reach_organisation(organisation_id), false));

drop policy if exists "staff prepare contract packs" on public.contract_packs;
create policy "staff prepare contract packs" on public.contract_packs
	for all using (public.is_administrator()) with check (public.is_administrator());

drop policy if exists "people on an organisation read its contract pack documents" on public.contract_pack_documents;
create policy "people on an organisation read its contract pack documents" on public.contract_pack_documents
	for select using (
		exists (
			select 1 from public.contract_packs pack
			where pack.id = pack_id
				and (public.is_administrator() or coalesce(public.can_reach_organisation(pack.organisation_id), false))
		)
	);

drop policy if exists "staff put documents in contract packs" on public.contract_pack_documents;
create policy "staff put documents in contract packs" on public.contract_pack_documents
	for all using (public.is_administrator()) with check (public.is_administrator());

commit;

notify pgrst, 'reload schema';
