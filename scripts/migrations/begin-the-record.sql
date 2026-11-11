-- Begins the record of applied migrations in one transaction: every file that
-- was on main before the push, as run before the record began, and the
-- record's own migration, as run by the deploy. If it fails the record stays
-- empty, and the next run begins it again. Takes the psql variables
-- beforeCommit, beforeFingerprints, commit and recordFingerprints (JSON objects
-- from each file name to its fingerprint).
insert into public.applied_migrations (file_name, commit_sha, content_fingerprint, how_applied)
select recorded.key, :'beforeCommit', recorded.value, 'run_before_record'
from jsonb_each_text(:'beforeFingerprints'::jsonb) as recorded
on conflict (file_name) do nothing;

insert into public.applied_migrations (file_name, commit_sha, content_fingerprint, how_applied)
select recorded.key, :'commit', recorded.value, 'run_by_deploy'
from jsonb_each_text(:'recordFingerprints'::jsonb) as recorded
on conflict (file_name) do nothing;
