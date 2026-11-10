-- Every table in the public schema with its row count, as one JSON object.
-- It counts rows and never reads what a row holds. Run by
-- scripts/run-added-migrations.sh before the first migration and after the last.
select coalesce(jsonb_object_agg(counted.table_name, counted.row_count), '{}'::jsonb)
from (
	select
		tables.tablename as table_name,
		(xpath(
			'/row/row_count/text()',
			query_to_xml(format('select count(*) as row_count from public.%I', tables.tablename), false, true, '')
		))[1]::text::bigint as row_count
	from pg_catalog.pg_tables as tables
	where tables.schemaname = 'public'
) as counted;
