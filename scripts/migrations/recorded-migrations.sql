-- Every file on the record of applied migrations with the fingerprint its
-- contents had when it was recorded, one "<file name> <fingerprint>" line each,
-- in the byte order the runner sorts file names in.
select recorded.file_name || ' ' || recorded.content_fingerprint
from public.applied_migrations as recorded
order by recorded.file_name collate "C";
