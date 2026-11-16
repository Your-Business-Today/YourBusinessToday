-- 0254: the lines two first loads wrote as news are withdrawn from the feed.
--
-- On James's word, 16 Nov 2026 at 01:46 UTC: "Yes, clear them", for the
-- feeds of Sutton and Surbiton. Two first loads told those feeds things that
-- were not news. Sutton's first food sweep, on 26 Oct 2026 at 06:10 UTC,
-- wrote "The Food Standards Agency registered X" (premises_opened) for every
-- food business it loaded; 0252 stops a first sweep doing that again. The
-- first fill of both territories from Companies House, on 15 Nov 2026 at
-- 17:35 and 17:36 UTC, wrote "Holding company formed" for every holding
-- company at a trading company's address, decades old ones among them; 0253
-- stops that. The old lines still filled the feeds, and Surbiton's opened
-- with a hundred of them.
--
-- Migrations here only add, so nothing is deleted: a line is marked
-- withdrawn and the feed leaves it out. It keeps its key, so the trigger that
-- wrote it never writes it again, and the mark can be taken off. Exactly two
-- rules mark a line, on the outcodes of those two territories alone:
--   1. premises_opened, for a premises that is not a later arrival (0251),
--      tied to its line by the key 0089 gives it;
--   2. holding_company_over_trading, for a company that was not incorporated
--      within register_new_company_days() of the line's date, the test 0253
--      gives the trigger, so what stays is what the trigger writes today.
-- A line whose premises or company cannot be found stays. A notice says how
-- many of each were withdrawn; a second run withdraws none.
--
-- Adds one column with a default; no row's content is changed but the mark.
--
-- Its first run, on 16 Nov 2026 at 21:11 UTC, held the lock its new column
-- takes on area_events for fifteen minutes while the arrivals update compared
-- every line with every premises of its outcode through premises_change_key,
-- and the live site waited behind it until the database's statement timeout
-- rolled it back. So the update now finds a line's premises by the key with
-- its date taken off, a comparison Postgres can hash, and then checks the
-- whole key exactly as premises_change_key writes it; and the file gives up
-- in seconds rather than holding the site if it waits for the lock or runs
-- long.

begin;

set local lock_timeout = '10s';
set local statement_timeout = '2min';

alter table public.area_events add column if not exists is_withdrawn boolean not null default false;

do $$
declare
	premises_withdrawn integer;
	holding_companies_withdrawn integer;
begin
	with sutton_and_surbiton as (
		select outcode from public.patch_outcodes
		where patch_id in ('14a286e4-08d5-474b-ac97-deb49e953c75', '02d731bf-8d5e-40c9-82ac-3d84d387e945')
	),
	first_load_arrivals as (
		select listed.outcode, 'premises_opened:' || listed.source || ':' || listed.source_id || ':' as key_without_date
		from public.premises as listed
		where listed.outcode in (select outcode from sutton_and_surbiton)
			and not listed.is_later_arrival
	)
	update public.area_events as line set is_withdrawn = true
	from first_load_arrivals as arrival
	where line.kind = 'premises_opened'
		and not line.is_withdrawn
		and line.outcode in (select outcode from sutton_and_surbiton)
		and arrival.outcode = line.outcode
		and left(line.source_key, -length(line.happened_at::text)) = arrival.key_without_date
		and line.source_key = arrival.key_without_date || line.happened_at::text;
	get diagnostics premises_withdrawn = row_count;

	with sutton_and_surbiton as (
		select outcode from public.patch_outcodes
		where patch_id in ('14a286e4-08d5-474b-ac97-deb49e953c75', '02d731bf-8d5e-40c9-82ac-3d84d387e945')
	)
	update public.area_events as line set is_withdrawn = true
	from public.register_companies as company
	where line.kind = 'holding_company_over_trading'
		and not line.is_withdrawn
		and line.outcode in (select outcode from sutton_and_surbiton)
		and company.company_number = line.company_number
		and (company.incorporated_on is null or company.incorporated_on < line.happened_at - public.register_new_company_days());
	get diagnostics holding_companies_withdrawn = row_count;

	raise notice 'Withdrawn from the feed: % premises_opened lines and % holding_company_over_trading lines',
		premises_withdrawn, holding_companies_withdrawn;
end;
$$;

commit;

notify pgrst, 'reload schema';
