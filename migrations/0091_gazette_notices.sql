-- 0091: The Gazette's corporate insolvency notices reach the feed the day
-- they are published, matched to register companies by company number,
-- with no key. A company in trouble carries a status note on its register
-- row so its pin and its panel say so; the notice itself stays at The
-- Gazette, and no personal name from a notice is stored. Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

insert into public.area_event_kinds (kind, label) values
	('winding_up_petitioned', 'Winding-up petition'),
	('administration_opened', 'Administration opened'),
	('liquidator_appointed', 'Liquidator appointed')
on conflict (kind) do update set label = excluded.label;

alter table public.register_companies
	add column if not exists status_note text not null default '' check (char_length(status_note) <= 120);

drop function if exists public.patch_register_companies(uuid);
create function public.patch_register_companies(target_patch_id uuid)
returns table (
	company_number text, name text, registered_address text, postcode text, outcode text, sector text,
	company_status text, incorporated_on date, account_category text, sic_codes text[],
	next_accounts_due date, next_statement_due date, charge_count integer, first_seen_month date,
	last_seen_month date, is_gone boolean, source_url text, latitude double precision, longitude double precision,
	net_assets numeric, cash numeric, creditors numeric, average_employees integer, figures_made_up_to date, figures_source_url text,
	status_note text
)
language sql
stable
as $$
	select company.company_number, company.name, company.registered_address, company.postcode,
		company.outcode, company.sector, company.company_status, company.incorporated_on,
		company.account_category, company.sic_codes, company.next_accounts_due, company.next_statement_due,
		company.charge_count, company.first_seen_month, company.last_seen_month, company.is_gone,
		company.source_url, location.latitude, location.longitude,
		company.net_assets, company.cash, company.creditors, company.average_employees, company.figures_made_up_to, company.figures_source_url,
		company.status_note
	from public.register_companies as company
	join public.patch_outcodes as patch_outcode
		on patch_outcode.outcode = company.outcode and patch_outcode.patch_id = target_patch_id
	join public.postcode_locations as location on location.postcode = company.postcode
	where not company.is_gone
	order by company.company_number;
$$;

commit;

notify pgrst, 'reload schema';
