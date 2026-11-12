-- 0202: Sales joins the modules an administrator switches on for an
-- organisation, beside Books, Brand, Your Business Brain and Boardroom.
--
-- The module column's check (0145) is widened to accept 'sales'. No row is
-- written, so Sales starts off for every organisation, and no row, table or
-- column that exists changes. The check is found by what it guards rather
-- than by name, and put back under one name, so the file is safe to run twice.
-- The module names match organisationModules.ts.

begin;

do $$
declare
	module_check record;
begin
	for module_check in
		select constraint_row.conname
		from pg_constraint constraint_row
		where constraint_row.conrelid = 'public.organisation_modules'::regclass
			and constraint_row.contype = 'c'
			and pg_get_constraintdef(constraint_row.oid) like '%module%'
	loop
		execute format('alter table public.organisation_modules drop constraint %I', module_check.conname);
	end loop;
end
$$;

alter table public.organisation_modules
	add constraint organisation_modules_module_check
	check (module in ('books', 'brand', 'business_brain', 'boardroom', 'sales'));

commit;

notify pgrst, 'reload schema';
