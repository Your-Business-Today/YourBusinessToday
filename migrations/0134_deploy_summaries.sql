-- 0134: each promotion of staging keeps a summary of the tasks it deployed.
--
-- The merge commits staging holds ahead of the default branch name the pull
-- requests that merged into staging, and each task records its branch and
-- pull request, so a promotion can say which tasks it carries. The same
-- lines go on the promotion pull request's body and are kept here, so the
-- project page and the connector can say what a deploy carried.
--
-- Additive and safe to re-run.

begin;

alter table public.project_deploy_windows
	add column if not exists summary text not null default '';

commit;

notify pgrst, 'reload schema';
