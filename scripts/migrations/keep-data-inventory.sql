-- Keeps a migration run's two readings in data_inventories, when the table is
-- there; on the run that adds it, the reading before is kept once it exists.
-- Takes the psql variables commit, files (a text[] literal), before,
-- beforeTakenAt, after and afterTakenAt.
select to_regclass('public.data_inventories') is not null as has_inventory_table \gset

\if :has_inventory_table
with run as (select gen_random_uuid() as id)
insert into public.data_inventories (migration_run_id, moment, taken_at, commit_sha, migration_files, row_counts)
select run.id, reading.moment, reading.taken_at, :'commit', :'files'::text[], reading.row_counts
from run, (values
	('before', :'beforeTakenAt'::timestamptz, :'before'::jsonb),
	('after', :'afterTakenAt'::timestamptz, :'after'::jsonb)
) as reading (moment, taken_at, row_counts);
\else
\echo '::warning::data_inventories is not there, so this run''s row counts were checked but not kept.'
\endif
