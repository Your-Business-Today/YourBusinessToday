-- 0142: a new order for a ranked list is saved in one statement.
--
-- The site saved a board, a goal list or a task order as one update per row,
-- all sent at once, each its own transaction. On the project board every one
-- of those updates fires team_boards_follow_owner_order (0104), which re-ranks
-- the board of everyone on the project, so two of them locked the same
-- membership rows in opposite orders and Postgres killed one (40P01). The rest
-- had already committed: moving Your Build Today below Carp Mania half-saved,
-- left both at priority 13 with nothing at 12, and answered with a 500
-- (James, 1 Nov 2026, ref 0c65d648).
--
-- Each ranked list now has one function that writes every changed rank in a
-- single update, so the order saves whole or not at all. They run as the
-- caller (security invoker), so row level security decides what may be
-- written exactly as it did for the separate updates. A project board also
-- takes a lock on its owner first, so two reorders of the same board wait for
-- each other instead of deadlocking through the team boards.
--
-- Last, every owner's project board is closed up, which mends the board the
-- failed save left with two projects at one rank. Order is kept.
-- Adds functions only; safe to run twice.

begin;

create or replace function public.save_project_board_ranks(board_owner uuid, project_ids uuid[], ranks integer[])
returns void
language plpgsql
security invoker
set search_path to 'public'
as $$
begin
	perform pg_advisory_xact_lock(hashtextextended('project_board:' || board_owner::text, 0));
	update public.projects as project
	set priority = change.rank
	from unnest(project_ids, ranks) as change(id, rank)
	where project.id = change.id
		and project.owner_id = board_owner
		and project.priority is distinct from change.rank;
end;
$$;

create or replace function public.save_team_board_ranks(board_member uuid, project_ids uuid[], ranks integer[])
returns void
language sql
security invoker
set search_path to 'public'
as $$
	update public.project_members as membership
	set priority = change.rank
	from unnest(project_ids, ranks) as change(project_id, rank)
	where membership.account_id = board_member
		and membership.project_id = change.project_id
		and membership.priority is distinct from change.rank;
$$;

create or replace function public.save_goal_ranks(goal_ids uuid[], ranks integer[])
returns void
language sql
security invoker
set search_path to 'public'
as $$
	update public.goals as goal
	set priority = change.rank
	from unnest(goal_ids, ranks) as change(id, rank)
	where goal.id = change.id and goal.priority is distinct from change.rank;
$$;

create or replace function public.save_task_ranks(
	priority_task_ids uuid[],
	priorities integer[],
	queue_task_ids uuid[],
	queue_ranks integer[]
)
returns void
language plpgsql
security invoker
set search_path to 'public'
as $$
begin
	update public.tasks as task
	set priority = change.rank
	from unnest(priority_task_ids, priorities) as change(id, rank)
	where task.id = change.id and task.priority is distinct from change.rank;

	update public.tasks as task
	set global_priority = change.rank
	from unnest(queue_task_ids, queue_ranks) as change(id, rank)
	where task.id = change.id and task.global_priority is distinct from change.rank;
end;
$$;

revoke all on function public.save_project_board_ranks(uuid, uuid[], integer[]) from public, anon;
revoke all on function public.save_team_board_ranks(uuid, uuid[], integer[]) from public, anon;
revoke all on function public.save_goal_ranks(uuid[], integer[]) from public, anon;
revoke all on function public.save_task_ranks(uuid[], integer[], uuid[], integer[]) from public, anon;
grant execute on function public.save_project_board_ranks(uuid, uuid[], integer[]) to authenticated, service_role;
grant execute on function public.save_team_board_ranks(uuid, uuid[], integer[]) to authenticated, service_role;
grant execute on function public.save_goal_ranks(uuid[], integer[]) to authenticated, service_role;
grant execute on function public.save_task_ranks(uuid[], integer[], uuid[], integer[]) to authenticated, service_role;

select public.compact_project_board(owner_id)
from (select distinct owner_id from public.projects) as owners;

commit;

notify pgrst, 'reload schema';
