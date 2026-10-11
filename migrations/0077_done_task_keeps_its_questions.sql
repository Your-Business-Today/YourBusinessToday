-- 0077: a question stays open when its task is marked done.
--
-- 0066 cleared every baton on a task the moment it was marked done, so a
-- question still waiting on someone vanished whenever the work finished first —
-- most often when a pull request merged and marked its task done by itself.
-- That is how a question on the Jewel PFP Portal went unanswered until it was
-- chased outside YBT. A question is now open until the person it waits on
-- speaks on the thread (0073), whatever the task's status, and
-- list_waiting_on_me shows it with the task marked Done.
--
-- Batons 0066 already cleared are not restored: nothing records which they were.
--
-- Safe to re-run. Run once, by hand, through scripts/run-migration.sh.

begin;

drop trigger if exists done_task_clears_its_baton on public.tasks;
drop function if exists public.clear_baton_on_task_done();

commit;
