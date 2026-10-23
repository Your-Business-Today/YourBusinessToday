-- 0131: a task being built shows as In progress.
--
-- Until now only a person (or a progress note) moved a task to In progress.
-- The steps Claude sessions record (building, built, reviewing, pull request
-- open), a branch set on the task and GitHub's pull-request-opened event were
-- logged but left the task in the backlog until its merge marked it done, so
-- a project's "in progress" count read 0 while its work was being built.
-- The code now moves a backlog task to In progress on those steps. This
-- brings the tasks already under way into line: a backlog task with a branch
-- recorded, or whose latest step is one of those, is In progress. A task whose
-- latest step released it, a task on hold and a task done are left as they are.
--
-- Safe to run twice.

begin;

update public.tasks
set status = 'in_progress'
where status = 'backlog'
	and (
		branch_name <> ''
		or (
			select latest.step
			from public.lifecycle_steps as latest
			where latest.task_id = tasks.id
			order by latest.created_at desc
			limit 1
		) in ('building', 'built', 'reviewing', 'pull_request_open')
	);

commit;
