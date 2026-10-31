-- 0136: an ask says what kind of thing it asks for, and each person keeps their own to-dos.
--
-- A message waiting on someone asks them for information (an answer or a file only
-- they hold), setup (an account, a key, a DNS record, a payment) or testing (confirm a
-- merged feature works). The kind sits on the message beside who it waits on.
--
-- A to-do is a job a person has to do that must not hold development up. It belongs to
-- one person, or to nobody yet when anyone on the project may take it; it may be linked
-- to the project task it was born out of, which it never blocks. A to-do linked to a
-- task belongs to that task's project, so everyone on the project can see it there.
--
-- Additive and safe to re-run. The code that reads these stands without them.

begin;

alter table public.conversation_messages add column if not exists ask_kind text;

alter table public.conversation_messages drop constraint if exists conversation_messages_ask_kind_check;
alter table public.conversation_messages add constraint conversation_messages_ask_kind_check
	check (ask_kind is null or ask_kind in ('information', 'setup', 'testing'));

create table if not exists public.todos (
	id uuid primary key default gen_random_uuid(),
	owner_account_id uuid references auth.users (id) on delete set null,
	project_id uuid references public.projects (id) on delete cascade,
	task_id uuid references public.tasks (id) on delete set null,
	title text not null check (char_length(title) between 1 and 200),
	notes text check (notes is null or char_length(notes) <= 4000),
	status text not null default 'to_do' check (status in ('to_do', 'doing', 'done')),
	due_date date,
	created_by uuid not null references auth.users (id) on delete cascade,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	completed_at timestamptz,
	check (owner_account_id is not null or project_id is not null)
);

create index if not exists todos_owner_account_id_idx on public.todos (owner_account_id);
create index if not exists todos_task_id_idx on public.todos (task_id);
create index if not exists todos_project_id_idx on public.todos (project_id);

alter table public.todos enable row level security;

drop policy if exists "people read their own and their projects' to-dos" on public.todos;
create policy "people read their own and their projects' to-dos" on public.todos
	for select using (
		owner_account_id = auth.uid()
		or created_by = auth.uid()
		or (project_id is not null and public.can_reach_project(project_id))
	);

drop policy if exists "people add to-dos for themselves or their projects" on public.todos;
create policy "people add to-dos for themselves or their projects" on public.todos
	for insert with check (
		created_by = auth.uid()
		and (project_id is null or public.can_reach_project(project_id))
		and (owner_account_id = auth.uid() or project_id is not null)
	);

drop policy if exists "people change their own and their projects' to-dos" on public.todos;
create policy "people change their own and their projects' to-dos" on public.todos
	for update using (
		owner_account_id = auth.uid()
		or created_by = auth.uid()
		or (project_id is not null and public.can_reach_project(project_id))
	);

drop policy if exists "people delete to-dos they own or raised" on public.todos;
create policy "people delete to-dos they own or raised" on public.todos
	for delete using (owner_account_id = auth.uid() or created_by = auth.uid());

grant select, insert, update, delete on public.todos to authenticated, service_role;

commit;
