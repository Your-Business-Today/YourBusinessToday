-- 0280: a task that changes a system's design waits for YBT's approval.
--
-- Most requests extend a system in the shape it already has. A request that
-- changes the design (a new way of doing what the system already does, the
-- same fact kept in a second place, a rule worked around) is raised as
-- requested and waits for YBT before anything builds it:
--
--   design_review_state    null when the task only extends the design;
--                          awaiting, approved or rejected when it changes it
--   design_change          what the request changes, and why the person needs it
--   design_review_reason   YBT's reason for its answer
--   design_reviewed_by     who at YBT answered
--   design_reviewed_at     when they answered
--
-- Only YBT staff (or the server itself) may answer: a trigger refuses anyone
-- else who sets the state to approved or rejected, or names a reviewer.
--
-- Additive: new columns on tasks, existing rows kept as they are. Safe to run twice.

begin;

set local lock_timeout = '5s';

alter table public.tasks add column if not exists design_review_state text;
alter table public.tasks add column if not exists design_change text;
alter table public.tasks add column if not exists design_review_reason text;
alter table public.tasks add column if not exists design_reviewed_by uuid references public.profiles (id) on delete set null;
alter table public.tasks add column if not exists design_reviewed_at timestamptz;

alter table public.tasks drop constraint if exists tasks_design_review_state_check;
alter table public.tasks add constraint tasks_design_review_state_check
	check (design_review_state is null or design_review_state in ('awaiting', 'approved', 'rejected'));

alter table public.tasks drop constraint if exists tasks_design_change_length_check;
alter table public.tasks add constraint tasks_design_change_length_check
	check (design_change is null or char_length(design_change) <= 2000);

alter table public.tasks drop constraint if exists tasks_design_review_reason_length_check;
alter table public.tasks add constraint tasks_design_review_reason_length_check
	check (design_review_reason is null or char_length(design_review_reason) <= 2000);

create index if not exists tasks_awaiting_design_approval
	on public.tasks (project_id) where design_review_state = 'awaiting';

create or replace function public.guard_design_review_answer()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	is_answer boolean;
begin
	is_answer := new.design_review_state in ('approved', 'rejected') or new.design_reviewed_by is not null;
	if tg_op = 'UPDATE' then
		is_answer := is_answer and (
			new.design_review_state is distinct from old.design_review_state
			or new.design_reviewed_by is distinct from old.design_reviewed_by
		);
	end if;
	if not is_answer or auth.role() = 'service_role' or auth.uid() is null then
		return new;
	end if;
	if public.is_staff_account(auth.uid()) then
		return new;
	end if;
	raise exception 'Only Your Business Today staff can approve or reject a design change.';
end;
$$;

drop trigger if exists tasks_guard_design_review_answer on public.tasks;
create trigger tasks_guard_design_review_answer
	before insert or update on public.tasks
	for each row execute function public.guard_design_review_answer();

commit;

notify pgrst, 'reload schema';
