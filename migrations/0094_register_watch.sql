-- 0094: the daily Companies House watch tells the feed who was incorporated
-- or dissolved in a patch yesterday, instead of next month. A company the
-- watch sees is written to the register with what a search answer carries
-- and nothing it does not: the accounts columns the monthly file fills are
-- left as they are. Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

insert into public.area_event_kinds (kind, label) values
	('company_incorporated', 'Company incorporated'),
	('company_dissolved', 'Company dissolved')
on conflict (kind) do update set label = excluded.label;

create or replace function public.upsert_watched_companies(rows jsonb)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	written integer;
begin
	if auth.role() <> 'service_role' then
		raise exception 'Only the service role writes watched companies' using errcode = '42501';
	end if;
	with incoming as (
		select * from jsonb_to_recordset(rows) as row_in (
			company_number text, name text, registered_address text, postcode text, outcode text, sector text,
			company_status text, incorporated_on date, sic_codes text[], seen_month date, source_url text
		)
	),
	upserted as (
		insert into public.register_companies (
			company_number, name, registered_address, postcode, outcode, sector, company_status, incorporated_on,
			sic_codes, first_seen_month, last_seen_month, is_gone, source_url
		)
		select company_number, name, registered_address, postcode, outcode, sector, company_status, incorporated_on,
			sic_codes, seen_month, seen_month, false, source_url
		from incoming
		on conflict (company_number) do update set
			name = excluded.name,
			registered_address = excluded.registered_address,
			postcode = excluded.postcode,
			outcode = excluded.outcode,
			sector = excluded.sector,
			company_status = excluded.company_status,
			incorporated_on = coalesce(excluded.incorporated_on, public.register_companies.incorporated_on),
			sic_codes = case when array_length(excluded.sic_codes, 1) is null then public.register_companies.sic_codes else excluded.sic_codes end,
			last_seen_month = greatest(public.register_companies.last_seen_month, excluded.last_seen_month),
			source_url = excluded.source_url
		returning 1
	)
	select count(*) into written from upserted;
	return written;
end;
$$;

commit;

notify pgrst, 'reload schema';
