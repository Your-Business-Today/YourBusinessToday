-- One line for each table that has fewer rows in the reading after the
-- migrations than in the one before; a table that is gone counts as empty.
-- Takes the two readings as the psql variables before and after.
select format(
	'%s has %s fewer rows (%s before, %s after)',
	before.key,
	before.value::bigint - coalesce((:'after'::jsonb ->> before.key)::bigint, 0),
	before.value,
	coalesce(:'after'::jsonb ->> before.key, 'gone')
)
from jsonb_each_text(:'before'::jsonb) as before
where coalesce((:'after'::jsonb ->> before.key)::bigint, 0) < before.value::bigint
order by before.key;
