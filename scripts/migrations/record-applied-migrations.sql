-- Puts migration files on the record of applied migrations, each with the
-- fingerprint of its contents. A file already on the record keeps the row it
-- has, so recording twice changes nothing. Takes the psql variables commit,
-- howApplied (run_by_deploy or run_before_record) and fingerprints, a JSON
-- object from each file name to its fingerprint.
insert into public.applied_migrations (file_name, commit_sha, content_fingerprint, how_applied)
select recorded.key, :'commit', recorded.value, :'howApplied'
from jsonb_each_text(:'fingerprints'::jsonb) as recorded
on conflict (file_name) do nothing;
