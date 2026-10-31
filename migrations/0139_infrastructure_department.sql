-- 0139: infrastructure is a department of its own.
--
-- The systems a project runs on — cloud settings, secrets, servers, hosting accounts — are
-- set by hand by a developer, so they are neither built by Claude nor the running of the
-- business. They sit on an Infrastructure tab beside Development, done by their assignee.
--
-- Additive and safe to re-run: the check constraints only widen, and no row changes.

begin;

alter table public.tasks drop constraint if exists tasks_department_check;
alter table public.tasks add constraint tasks_department_check
	check (department in ('development', 'infrastructure', 'administration', 'sales', 'marketing'));

alter table public.goals drop constraint if exists goals_department_check;
alter table public.goals add constraint goals_department_check
	check (department in ('development', 'infrastructure', 'administration', 'sales', 'marketing'));

commit;
