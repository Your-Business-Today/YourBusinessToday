-- 0246: the postcodes the postcode service does not know.
--
-- A register company is placed on the map by asking postcodes.io where its
-- postcode is, and the answer is kept in postcode_locations. A postcode the
-- service does not know, one since retired or one mistyped at Companies House,
-- was kept nowhere, so the list of postcodes still to place served it again on
-- every page: three in the first hundred asked on 15 Nov 2026 and seven by the
-- fourth page. Once a hundred of them head the list no page places anything, and
-- the postcodes behind them are never asked about.
--
-- postcodes_not_found keeps each one with when it was last asked. The list of
-- postcodes still to place and its count leave a postcode out for thirty days
-- after it was asked, so the count reaches nothing and the list never stalls,
-- and a postcode the service learns later is still placed.
--
-- Adds a table and a function, and replaces two functions under the same
-- signatures; nothing existing is dropped or rewritten. Safe to re-run.

begin;

create table if not exists public.postcodes_not_found (
	postcode text primary key,
	asked_at timestamptz not null default now()
);

alter table public.postcodes_not_found enable row level security;

drop policy if exists "project managers manage postcodes not found" on public.postcodes_not_found;
create policy "project managers manage postcodes not found" on public.postcodes_not_found
	for all using (public.is_project_manager()) with check (public.is_project_manager());

create or replace function public.days_before_a_postcode_is_asked_again()
returns integer
language sql
immutable
as $$ select 30; $$;

-- The register postcodes in any patch that the location cache does not hold yet, and that were not asked about lately.
create or replace function public.register_postcodes_to_geocode(page_size integer)
returns table (postcode text)
language sql
stable
as $$
	select distinct company.postcode
	from public.register_companies as company
	join public.patch_outcodes as patch_outcode on patch_outcode.outcode = company.outcode
	left join public.postcode_locations as location on location.postcode = company.postcode
	left join public.postcodes_not_found as not_found
		on not_found.postcode = company.postcode
		and not_found.asked_at > now() - make_interval(days => public.days_before_a_postcode_is_asked_again())
	where company.postcode <> '' and location.postcode is null and not_found.postcode is null and not company.is_gone
	limit page_size;
$$;

create or replace function public.count_register_postcodes_to_geocode()
returns integer
language sql
stable
as $$
	select count(distinct company.postcode)::integer
	from public.register_companies as company
	join public.patch_outcodes as patch_outcode on patch_outcode.outcode = company.outcode
	left join public.postcode_locations as location on location.postcode = company.postcode
	left join public.postcodes_not_found as not_found
		on not_found.postcode = company.postcode
		and not_found.asked_at > now() - make_interval(days => public.days_before_a_postcode_is_asked_again())
	where company.postcode <> '' and location.postcode is null and not_found.postcode is null and not company.is_gone;
$$;

commit;

notify pgrst, 'reload schema';
