-- Takes off the record the files a rehearsal run applied for one commit, so
-- the rehearsal's second run applies them again and proves each is safe to run
-- twice. Run on the scratch database alone, never on the live one. Takes the
-- psql variable commit.
select to_regclass('public.applied_migrations') is not null as has_record_table \gset

\if :has_record_table
delete from public.applied_migrations
where commit_sha = :'commit' and how_applied = 'run_by_deploy';
\endif
