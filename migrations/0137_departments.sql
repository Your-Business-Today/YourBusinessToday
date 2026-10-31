-- 0137: a project's goals and tasks each belong to a department.
--
-- A project is not only development: beside the work Claude builds sit the business jobs
-- a project needs, done by people. Every goal and task names its department —
-- development, administration, sales or marketing — and the project page shows one tab
-- for each. Tasks in different departments may wait for each other as any tasks do.
-- Everything already on a board is development.
--
-- Additive and safe to re-run. The code reads a missing department as development.

begin;

alter table public.tasks add column if not exists department text not null default 'development';
alter table public.tasks drop constraint if exists tasks_department_check;
alter table public.tasks add constraint tasks_department_check
	check (department in ('development', 'administration', 'sales', 'marketing'));

alter table public.goals add column if not exists department text not null default 'development';
alter table public.goals drop constraint if exists goals_department_check;
alter table public.goals add constraint goals_department_check
	check (department in ('development', 'administration', 'sales', 'marketing'));

create index if not exists tasks_project_department_idx on public.tasks (project_id, department);

commit;
