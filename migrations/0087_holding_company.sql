-- 0087: a newly registered holding company at the address of a live trading
-- company already on the register is flagged the month it appears: someone
-- has decided they need management information. Derived across companies
-- when the arriving row is written, never stored on one. Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

insert into public.area_event_kinds (kind, label) values
	('holding_company_over_trading', 'Holding company formed')
on conflict (kind) do update set label = excluded.label;

-- The SIC codes a holding or head-office company is registered under.
create or replace function public.holding_company_sic_codes()
returns text[]
language sql
immutable
as $$ select array['64209', '70100']; $$;

create or replace function public.register_companies_flag_holding_companies()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	trading public.register_companies;
begin
	if not (new.sic_codes && public.holding_company_sic_codes()) then
		return new;
	end if;
	select * into trading
	from public.register_companies as company
	where company.registered_address = new.registered_address
		and company.postcode = new.postcode
		and company.company_number <> new.company_number
		and not company.is_gone
		and upper(company.account_category) not in ('DORMANT', 'NO ACCOUNTS FILED')
		and not (company.sic_codes && public.holding_company_sic_codes())
	order by company.incorporated_on
	limit 1;
	if trading.company_number is null then
		return new;
	end if;
	perform public.write_area_event(new.outcode, new.sector, null, 'holding_company_over_trading', new.company_number, null, null,
		new.name || ' was registered at the address of ' || trading.name || ' (' || trading.company_number || ')',
		new.source_url, public.register_change_key('holding_company_over_trading', new), new.last_seen_month, null);
	return new;
end;
$$;

drop trigger if exists register_companies_flag_holding_companies on public.register_companies;
create trigger register_companies_flag_holding_companies
	after insert on public.register_companies
	for each row execute function public.register_companies_flag_holding_companies();

commit;

notify pgrst, 'reload schema';
