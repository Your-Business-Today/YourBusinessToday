-- 0072: the project feed — every task event, as it happens, and the person who
-- asked for a task told when it is done.
--
-- Until now a person who raised a task found out it was finished by opening it.
-- Every move a task makes is now one row in project_events, written by a
-- trigger on tasks so it holds whichever door made the move: the site, the
-- connector, or GitHub's webhook marking a task done when its pull request
-- merges. The site shows the rows newest first at /projects/feed, and the
-- connector reads the same rows through read_project_feed.
--
-- The events: a task raised; moved to in progress (started), on hold, back to
-- the backlog, or done; and its pull request opened. Each row names the task,
-- who made the move, and the person the task is for: requested_by, or whoever
-- raised it. That last column is what "mine" on the feed filters by, and who
-- is told.
--
-- Who made a status move is tasks.status_set_by, written by every door that
-- changes a status alongside the status itself: the connector runs as the
-- service role, so auth.uid() is empty there and the row has to say. A merged
-- pull request sets it to nothing, and the feed says the merge did it.
--
-- A task done also puts one notification on the bell of the person it is for,
-- unless they made the move themselves. The notifications table gains
-- event_id for it, beside message_id and comment_id. Trigger order matters
-- here: done_task_clears_notifications (0060) and this trigger both fire after
-- an update of status, in name order, so the clearing runs first and the new
-- notification survives it — which is why this trigger is named to sort after.
--
-- Additive only. Safe to re-run. Run once, by hand, through scripts/run-migration.sh,
-- before the deploy that reads the table.

begin;

create table if not exists public.project_events (
	id uuid primary key default gen_random_uuid(),
	project_id uuid not null references public.projects (id) on delete cascade,
	task_id uuid not null references public.tasks (id) on delete cascade,
	kind text not null,
	actor_account_id uuid references auth.users (id) on delete set null,
	for_account_id uuid references auth.users (id) on delete set null,
	detail text not null default '',
	created_at timestamptz not null default now()
);

alter table public.project_events drop constraint if exists project_events_kind_check;
alter table public.project_events add constraint project_events_kind_check
	check (kind in (
		'task_raised',
		'task_started',
		'task_put_on_hold',
		'task_returned_to_backlog',
		'pull_request_opened',
		'task_done'
	));

create index if not exists project_events_by_project_time
	on public.project_events (project_id, created_at desc);

create index if not exists project_events_for_account_time
	on public.project_events (for_account_id, created_at desc)
	where for_account_id is not null;

alter table public.project_events enable row level security;

drop policy if exists "people read events on their projects" on public.project_events;
create policy "people read events on their projects" on public.project_events
	for select using (public.can_reach_project(project_id));

alter table public.notifications
	add column if not exists event_id uuid references public.project_events (id) on delete cascade;

alter table public.tasks
	add column if not exists status_set_by uuid references auth.users (id) on delete set null;

create or replace function public.task_event_kind_for_status(new_status text)
returns text
language sql
immutable
as $$
	select case new_status
		when 'in_progress' then 'task_started'
		when 'on_hold' then 'task_put_on_hold'
		when 'done' then 'task_done'
		else 'task_returned_to_backlog'
	end;
$$;

create or replace function public.record_task_event(
	task public.tasks,
	event_kind text,
	actor uuid,
	event_detail text default ''
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	for_account uuid := coalesce(task.requested_by, task.created_by);
	event_id uuid;
begin
	insert into public.project_events (project_id, task_id, kind, actor_account_id, for_account_id, detail)
	values (task.project_id, task.id, event_kind, actor, for_account, event_detail)
	returning id into event_id;
	if event_kind <> 'task_done' or for_account is null or for_account = actor then
		return;
	end if;
	if not exists (select 1 from public.profiles where id = for_account) then
		return;
	end if;
	insert into public.notifications (recipient_id, task_id, event_id)
	values (for_account, task.id, event_id);
end;
$$;

create or replace function public.tasks_write_feed_events()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if tg_op = 'INSERT' then
		perform public.record_task_event(new, 'task_raised', new.created_by);
		return new;
	end if;
	if new.status <> old.status then
		perform public.record_task_event(
			new, public.task_event_kind_for_status(new.status), coalesce(new.status_set_by, auth.uid()));
	end if;
	if coalesce(new.pull_request_url, '') <> '' and coalesce(old.pull_request_url, '') = '' then
		perform public.record_task_event(new, 'pull_request_opened', auth.uid(), new.pull_request_url);
	end if;
	return new;
end;
$$;

drop trigger if exists tasks_write_feed_events on public.tasks;
create trigger tasks_write_feed_events
	after insert or update of status, pull_request_url on public.tasks
	for each row execute function public.tasks_write_feed_events();

commit;

notify pgrst, 'reload schema';
