-- 0061: one trigger clears a done task's notifications, not two.
--
-- The same story was built twice and both migrations numbered 0060 were
-- merged. 0060_done_task_clears_notifications.sql is the one kept; this drops
-- what the other one created, if it was ever applied. Nothing about what a
-- person sees changes: the kept trigger already does the same delete.
--
-- Safe to re-run. Run once, by hand, through scripts/run-migration.sh.

begin;

drop trigger if exists task_done_clears_notifications on public.tasks;
drop function if exists public.clear_notifications_of_done_task();

commit;
