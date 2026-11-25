-- 0286: YBT sends a client their contract pack, and the pack says to whom and when.
--
-- James, task 8459f5c1, point 3: "Before sending, the action shows exactly
-- what goes, to whom and from which address, and sends only on confirmation."
-- The contact gets one email with one link to the pack in the client portal,
-- and the pack moves to sent.
--
--   contract_packs.sent_at              when the pack was last sent.
--   contract_packs.sent_to_contact_id   the client contact it went to.
--   contract_packs.sent_to              the address it went to, as it was
--                                       when it went.
--
-- Adds only: three columns, empty until a pack is sent. Safe to re-run.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '1min';

alter table public.contract_packs
	add column if not exists sent_at timestamptz,
	add column if not exists sent_to_contact_id uuid references public.client_contacts (id) on delete set null,
	add column if not exists sent_to text check (sent_to is null or char_length(sent_to) between 3 and 254);

commit;

notify pgrst, 'reload schema';
