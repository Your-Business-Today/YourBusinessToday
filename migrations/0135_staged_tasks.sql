-- 0135: a task remembers when its work reached staging and when it went live.
--
-- A pull request merging into staging marks its task done, but the work is
-- not live until staging is promoted to the default branch. staged_at is set
-- by that merge and live_at by the promotion's merge, so the project page can
-- list what the next deploy will carry and each task can say where its work
-- stands. The backfill reads the merge messages already on the tasks and the
-- promotions already run, so today's staged work shows from the first deploy.
--
-- Additive and safe to re-run.

begin;

alter table public.tasks
	add column if not exists staged_at timestamptz,
	add column if not exists live_at timestamptz;

create index if not exists tasks_staged_not_live
	on public.tasks (project_id) where staged_at is not null and live_at is null;

update public.tasks as tasks
set staged_at = staged.first_merge_at
from (
	select task_id, min(created_at) as first_merge_at
	from public.conversation_messages
	where task_id is not null and body like 'Merged: % brought % into staging%'
	group by task_id
) as staged
where tasks.id = staged.task_id and tasks.staged_at is null;

update public.tasks as tasks
set live_at = promotions.last_promoted_at
from (
	select project_id, max(ran_at) as last_promoted_at
	from public.project_deploy_windows
	where outcome in ('opened', 'reused')
	group by project_id
) as promotions
where tasks.project_id = promotions.project_id
	and tasks.staged_at is not null
	and tasks.live_at is null
	and tasks.staged_at <= promotions.last_promoted_at;

commit;

notify pgrst, 'reload schema';
