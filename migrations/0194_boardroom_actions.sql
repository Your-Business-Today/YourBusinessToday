-- 0194: what a meeting agrees becomes tasks and to-dos for the people who own them.
--
--   boardroom_actions          one action a meeting agrees on an item for decision:
--                              what is to be done, its owner (kept by account id,
--                              with their name as it stood), its date where given,
--                              and either a project (by id, with its name as it
--                              stood) and the department of a person's job, or no
--                              project, when it goes on the owner's own to-do list.
--   boardroom_action_raisings  the action raised, once: whether as a task or a
--                              to-do, and the id the task or to-do is made with.
--                              The row is written before the task or to-do is
--                              made, so a second raiser meets the key and stops.
--
-- An action is recorded while its meeting is open and before the first answer to
-- its item's decision. The first answer keeps the decision (0189), and from then
-- its actions are fixed: a change afterwards is a replacing decision with its
-- own actions. An action is raised once its decision has been answered; the
-- service raises it only when the decision carried.
--
-- The task or to-do raised is linked by id with no foreign key, as Boardroom
-- keeps accounts, so a board deletes a task as it always has; so is the project.
-- Nothing is added to tasks, todos, task_assignees, projects or any other table
-- made before Boardroom: this migration only makes its own two tables.
--
-- Nothing here is edited or deleted, whoever asks, and nothing is deleted by a
-- cascade (on delete restrict). The connector and the site write every row
-- through the service role after their own director check, so no policy lets
-- anyone write from the app. Every director of the board reads every action
-- and how it was raised.
--
-- The limits are stated once beside the service in boardroomActionRules.ts.
-- Additive and safe to re-run; the code that reads these tables stands
-- without them.

begin;

create table if not exists public.boardroom_actions (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	meeting_id uuid not null,
	agenda_item_id uuid not null,
	what text not null check (char_length(what) between 1 and 200),
	owner_account_id uuid not null,
	owner_name text not null check (char_length(owner_name) between 1 and 320),
	due_on date,
	project_id uuid,
	project_name text check (char_length(project_name) between 1 and 500),
	department text check (department in ('infrastructure', 'administration', 'sales', 'marketing')),
	recorded_by_director_id uuid not null,
	recorded_by uuid not null,
	recorded_at timestamptz not null default now(),
	check ((project_id is null) = (department is null)),
	check ((project_id is null) = (project_name is null)),
	unique (id, meeting_id),
	foreign key (meeting_id, organisation_id)
		references public.boardroom_meetings (id, organisation_id) on delete restrict,
	foreign key (agenda_item_id, meeting_id)
		references public.boardroom_agenda_items (id, meeting_id) on delete restrict,
	foreign key (recorded_by_director_id, organisation_id)
		references public.boardroom_directors (id, organisation_id) on delete restrict
);

create index if not exists boardroom_actions_by_meeting
	on public.boardroom_actions (meeting_id);

create table if not exists public.boardroom_action_raisings (
	action_id uuid primary key,
	organisation_id uuid not null,
	meeting_id uuid not null,
	raised_as text not null check (raised_as in ('task', 'todo')),
	made_id uuid not null unique,
	raised_by uuid not null,
	raised_at timestamptz not null default now(),
	foreign key (action_id, meeting_id)
		references public.boardroom_actions (id, meeting_id) on delete restrict,
	foreign key (meeting_id, organisation_id)
		references public.boardroom_meetings (id, organisation_id) on delete restrict
);

create index if not exists boardroom_action_raisings_by_meeting
	on public.boardroom_action_raisings (meeting_id);

create or replace function public.boardroom_item_decision_is_answered(item uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
	select exists (
		select 1
		from public.boardroom_decisions decision
		join public.boardroom_decision_answers answer on answer.decision_id = decision.id
		where decision.agenda_item_id = item
	);
$$;

create or replace function public.boardroom_actions_are_kept()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if tg_op <> 'INSERT' then
		raise exception 'An action the meeting agreed is kept as it was recorded; a change is a replacing decision with its own actions.';
	end if;
	if public.boardroom_meeting_stage(new.meeting_id) <> 'open' then
		raise exception 'Actions are recorded while their meeting is open.';
	end if;
	if not exists (
		select 1 from public.boardroom_agenda_items
		where id = new.agenda_item_id and purpose = 'decision' and withdrawn_at is null
	) then
		raise exception 'An action is recorded on an item for decision that stands on the agenda.';
	end if;
	if public.boardroom_item_decision_is_answered(new.agenda_item_id) then
		raise exception 'A decision''s actions are fixed once its first answer is given.';
	end if;
	if not exists (
		select 1 from public.boardroom_directors director
		join public.boardroom_meetings meeting on meeting.id = new.meeting_id
		where director.id = new.recorded_by_director_id
			and director.stood_down_at is null
			and director.named_at <= meeting.meets_at
	) then
		raise exception 'Only a sitting director who was on the meeting records its actions.';
	end if;
	return new;
end;
$$;

create or replace trigger boardroom_actions_are_kept
	before insert or update or delete on public.boardroom_actions
	for each row execute function public.boardroom_actions_are_kept();

create or replace function public.boardroom_action_raisings_are_kept()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if tg_op <> 'INSERT' then
		raise exception 'An action is raised once, and how it was raised is kept.';
	end if;
	if not public.boardroom_item_decision_is_answered(
		(select agenda_item_id from public.boardroom_actions where id = new.action_id)
	) then
		raise exception 'An action is raised only once the directors have answered the decision it comes from.';
	end if;
	if (new.raised_as = 'task') <> exists (
		select 1 from public.boardroom_actions where id = new.action_id and project_id is not null
	) then
		raise exception 'An action with a project is raised as a task; one with none goes on its owner''s to-do list.';
	end if;
	return new;
end;
$$;

create or replace trigger boardroom_action_raisings_are_kept
	before insert or update or delete on public.boardroom_action_raisings
	for each row execute function public.boardroom_action_raisings_are_kept();

alter table public.boardroom_actions enable row level security;
alter table public.boardroom_action_raisings enable row level security;

drop policy if exists "directors read their board's actions" on public.boardroom_actions;
create policy "directors read their board's actions" on public.boardroom_actions
	for select using (public.is_boardroom_director(organisation_id));

drop policy if exists "directors read how their board's actions were raised" on public.boardroom_action_raisings;
create policy "directors read how their board's actions were raised" on public.boardroom_action_raisings
	for select using (public.is_boardroom_director(organisation_id));

grant select on public.boardroom_actions, public.boardroom_action_raisings to authenticated;
grant select, insert on public.boardroom_actions, public.boardroom_action_raisings to service_role;

commit;

notify pgrst, 'reload schema';
