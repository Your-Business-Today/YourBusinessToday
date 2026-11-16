-- 0253: a holding company is "formed" only when it was newly incorporated.
--
-- "Holding company formed" in the feed should mean a new holding company has
-- just been registered over a trading company: someone has just decided they
-- need management information. The trigger from 0087 wrote that line for
-- every arriving company under a holding or head-office SIC code at a live
-- trading company's address, whatever its age. Read on the live feed on
-- 16 Nov 2026: when Sutton and Surbiton were first filled from Companies
-- House on 15 Nov 2026, at 17:36 and 17:35 UTC, each feed was given at least
-- a hundred such lines, among them companies decades old (THE WHITE HOUSE
-- LIMITED, 01490183; COPYPRINT HOLDINGS LIMITED, 01563652), and Surbiton's
-- feed opened with nothing else.
--
-- 0086's first-load test on register_loads is not borrowed: the territories
-- are filled through upsert_watched_companies, which writes no register_loads
-- row, so by that test every load would be a first load for ever and the
-- signal would never fire. The arriving company's own age is the test, the
-- one 0086 uses to tell arrived from moved in: incorporated within
-- register_new_company_days() of the month it is first seen. So a first load
-- announces only the formations of the last ninety days, which are true, and
-- an old holding company that only moves its office to a shared address is
-- not called formed on any load. Its moved-in line from 0086 is untouched.
--
-- Replaces the holding company trigger function under the signature it has;
-- the trigger 0087 made stays as it is. No table, column or row is touched
-- and nothing is dropped. Safe to re-run.

begin;

-- From 0087, with the one early return for a company that is not newly incorporated.
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
	if new.incorporated_on is null or new.incorporated_on < new.last_seen_month - public.register_new_company_days() then
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

commit;
