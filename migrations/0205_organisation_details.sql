-- 0205: what we must hold about a client we sign up, on its organisation.
--
-- An organisation already carries the address and the accounts contact its
-- invoices go to (0075). Signing a client up asks for more, and each of these
-- is something the law or our own contract has us hold:
--
--   legal_name, company_number,       the party the contract and every invoice
--   registered_in, registered_office  name: the parties clause of the Master
--                                     Services Agreement, and the customer's
--                                     name and address an invoice must carry
--                                     (VAT Regulations 1995, regulation 14)
--   vat_number                        the customer's VAT number, the evidence
--                                     that a customer outside the UK is in
--                                     business (VAT Notice 741A)
--   signatory_name, signatory_position,
--   signatory_email, notices_email    who signs for the client and where
--                                     notices under the contract are sent (the
--                                     agreement's signature block and its
--                                     notices clause)
--   data_contact_name, data_contact_email,
--   data_contact_phone,
--   data_protection_officer           the controller's contact that our record
--                                     of processing names, with its
--                                     representative or data protection officer
--                                     if it has one (UK GDPR, Article 30(2)),
--                                     and who we tell of a personal data breach
--                                     (Article 33(2))
--
-- No identity documents are held: the Money Laundering Regulations 2017 ask for
-- them only of a business that does a client's bookkeeping, tax or company
-- filings for it.
--
-- Every column is text, not null and blank by default, as the address and the
-- accounts contact are, so every organisation already there keeps what it
-- holds and reads blank for the rest. The length checks are the ones in
-- src/lib/data/organisationDetailGroups.ts; the site and the connector refuse a
-- longer value by name before the database is asked.
--
-- Additive and safe to re-run: a column that is already there is left as it
-- is. Nothing is dropped, renamed, copied or deleted, and the code that reads
-- these columns stands without them.

begin;

alter table public.organisations
	add column if not exists legal_name text not null default '' check (char_length(legal_name) <= 160),
	add column if not exists company_number text not null default '' check (char_length(company_number) <= 30),
	add column if not exists registered_in text not null default '' check (char_length(registered_in) <= 60),
	add column if not exists registered_office text not null default '' check (char_length(registered_office) <= 500),
	add column if not exists vat_number text not null default '' check (char_length(vat_number) <= 20),
	add column if not exists signatory_name text not null default '' check (char_length(signatory_name) <= 120),
	add column if not exists signatory_position text not null default '' check (char_length(signatory_position) <= 120),
	add column if not exists signatory_email text not null default '' check (char_length(signatory_email) <= 254),
	add column if not exists notices_email text not null default '' check (char_length(notices_email) <= 254),
	add column if not exists data_contact_name text not null default '' check (char_length(data_contact_name) <= 120),
	add column if not exists data_contact_email text not null default '' check (char_length(data_contact_email) <= 254),
	add column if not exists data_contact_phone text not null default '' check (char_length(data_contact_phone) <= 40),
	add column if not exists data_protection_officer text not null default '' check (char_length(data_protection_officer) <= 300);

commit;

notify pgrst, 'reload schema';
