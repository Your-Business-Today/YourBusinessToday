-- 0071: a task waits for the task before it, and a series of them is a task sequence.
--
-- Some tasks cannot start until another is done: set up the account, then
-- verify it, then pay the fee. Each task now records the one task it waits
-- for. Following those links back and forward gives the sequence the task sits
-- in, and the site shows every step where it has got to and what it waits for.
-- Before this, a held-up task went on hold with a message naming the task it
-- waited for, which nothing could read.
--
-- A task waits for one task on its own project, never for itself and never for
-- a task that comes after it, or the chain would never end. The trigger
-- refuses anything else, whichever door the write comes through.
--
-- When a task is done, every task waiting for it is told on its conversation,
-- as the person who finished it (or the project's owner when a merged pull
-- request did), so the next step's assignees hear that they can start.
--
-- Additive only. Safe to re-run. Run once, by hand, through scripts/run-migration.sh,
-- before the deploy that reads the column.

begin;

alter table public.tasks
	add column if not exists waits_for_task_id uuid;

alter table public.tasks drop constraint if exists tasks_waits_for_task_id_fkey;
alter table public.tasks add constraint tasks_waits_for_task_id_fkey
	foreign key (waits_for_task_id) references public.tasks (id) on delete set null;

create index if not exists tasks_by_waited_for_task
	on public.tasks (waits_for_task_id) where waits_for_task_id is not null;

create or replace function public.task_comes_after(candidate uuid, earlier uuid)
returns boolean
language sql
stable
set search_path to 'public'
as $$
	with recursive before as (
		select id, waits_for_task_id, 1 as depth from public.tasks where id = candidate
		union all
		select task.id, task.waits_for_task_id, before.depth + 1
		from public.tasks as task
		join before on task.id = before.waits_for_task_id
		where before.depth < 1000
	)
	select exists (select 1 from before where id = earlier);
$$;

create or replace function public.task_waits_for_an_earlier_task()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	waited_project uuid;
begin
	if new.waits_for_task_id is null then
		return new;
	end if;
	if new.waits_for_task_id = new.id then
		raise exception 'A task cannot wait for itself.';
	end if;
	select project_id into waited_project from public.tasks where id = new.waits_for_task_id;
	if waited_project is null or waited_project <> new.project_id then
		raise exception 'A task waits for a task on its own project.';
	end if;
	if public.task_comes_after(new.waits_for_task_id, new.id) then
		raise exception 'A task cannot wait for a task that comes after it.';
	end if;
	return new;
end;
$$;

drop trigger if exists task_waits_for_an_earlier_task on public.tasks;
create trigger task_waits_for_an_earlier_task
	before insert or update of waits_for_task_id on public.tasks
	for each row execute function public.task_waits_for_an_earlier_task();

create or replace function public.tell_followers_task_is_done()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if new.status <> 'done' or old.status = 'done' then
		return new;
	end if;
	insert into public.conversation_messages (task_id, author_account_id, body, posted_via)
	select
		follower.id,
		coalesce(auth.uid(), project.owner_id),
		format('"%s" is done, so this task, which was waiting for it, can start.', new.title),
		'site'
	from public.tasks as follower
	join public.projects as project on project.id = follower.project_id
	where follower.waits_for_task_id = new.id
		and follower.status <> 'done'
		and coalesce(auth.uid(), project.owner_id) is not null;
	return new;
end;
$$;

drop trigger if exists done_task_tells_its_followers on public.tasks;
create trigger done_task_tells_its_followers
	after update of status on public.tasks
	for each row execute function public.tell_followers_task_is_done();

revoke execute on function public.task_comes_after(uuid, uuid) from public, anon, authenticated;

commit;

notify pgrst, 'reload schema';
