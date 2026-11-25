-- 0280: a task can be marked as priority.
--
-- A person working the boards marks the tasks that matter most, and the boards
-- show the mark. Marking a task also puts it first among the tasks beside it,
-- through the priority order tasks already carry, so nothing else is reordered
-- by the mark itself and the priority numbers keep meaning their place.
--
-- Additive: one new column with a constant default, so no row is rewritten and
-- every existing task starts unmarked. Safe to run twice.

begin;

set local lock_timeout = '10s';
set local statement_timeout = '2min';

alter table public.tasks add column if not exists is_priority boolean not null default false;

commit;

notify pgrst, 'reload schema';
