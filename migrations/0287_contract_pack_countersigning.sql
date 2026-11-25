-- 0287: a YBT director countersigns a client-signed contract pack, and each
-- document is kept as a dated, signed PDF.
--
-- James, task 8459f5c1, point 5: "A YBT director countersigns from the pack's
-- screen or the connector, with name, position and date. Each signed document
-- is made into a PDF showing the version, who signed for each side and when,
-- and kept on the client's organisation documents as a version of that
-- document. The pack moves to countersigned."
--
--   contract_packs.countersigner_name       who signed for Your Business Today.
--   contract_packs.countersigner_position   their position.
--   contract_packs.countersigned_on         the day they signed.
--   contract_packs.countersigned_at         when it was kept.
--   contract_packs.countersigned_by         the director's account.
--   contract_pack_documents.signed_copy_version
--                                           the version of the organisation
--                                           document that holds the signed PDF.
--
-- The PDF itself is a version of the document (project_document_versions,
-- 0282), so it needs no table of its own.
--
-- Adds only: six columns, empty until a pack is countersigned. Safe to re-run.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '1min';

alter table public.contract_packs
	add column if not exists countersigner_name text check (countersigner_name is null or char_length(countersigner_name) between 1 and 120),
	add column if not exists countersigner_position text check (countersigner_position is null or char_length(countersigner_position) between 1 and 120),
	add column if not exists countersigned_on date,
	add column if not exists countersigned_at timestamptz,
	add column if not exists countersigned_by uuid references auth.users (id) on delete set null;

alter table public.contract_pack_documents
	add column if not exists signed_copy_version integer check (signed_copy_version is null or signed_copy_version between 1 and 9999);

commit;

notify pgrst, 'reload schema';
