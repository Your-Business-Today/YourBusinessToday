-- How many row count readings data_inventories holds for one commit: the
-- runner keeps two for each run, one before the first file and one after the
-- last. Answers 0 when the table is not there. Takes the psql variable commit.
-- Read by scripts/migrations/rehearse-added-migrations.sh on its scratch database.
select to_regclass('public.data_inventories') is not null as has_inventory_table \gset

\if :has_inventory_table
select count(*) from public.data_inventories where commit_sha = :'commit';
\else
select 0;
\endif
