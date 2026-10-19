-- 0124: main-branch runs are kept under their check's name, not their run title.
--
-- A workflow with a run-name gives each run the commit message as its title,
-- and YBT kept runs under that title, so every merge added a row and the
-- project header listed them all. Runs are now kept under the workflow's own
-- name, one row per check, and marked as such. Rows kept under a run title
-- before this are left where they are and no longer read; each workflow's
-- next run on main writes its own row.
--
-- Additive and safe to re-run.

begin;

alter table public.project_main_runs
	add column if not exists is_named_for_its_check boolean not null default false;

commit;

notify pgrst, 'reload schema';
