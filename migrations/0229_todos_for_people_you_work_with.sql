-- 0229: a to-do can go on the own list of anyone you work with, with no task behind it.
--
-- Until now a to-do on someone else's list had to hang under a task. A small company job,
-- such as entering a door code, serves no task, so it can now be put straight on the list of
-- anyone the person shares a project or an organisation with. The one who raised it keeps
-- seeing and changing it, as the policies on public.todos already allow its creator.
--
-- Additive and safe to re-run. The code that reads these stands without them.

begin;

create or replace function public.people_i_work_with()
returns table (id uuid, email text, display_name text)
language sql
stable
security definer
set search_path to 'public'
as $$
	with my_projects as (
		select projects.id from public.projects where projects.owner_id = auth.uid()
		union
		select project_members.project_id from public.project_members
		where project_members.account_id = auth.uid()
	),
	my_organisations as (
		select organisation_members.organisation_id from public.organisation_members
		where organisation_members.account_id = auth.uid()
	),
	colleagues as (
		select projects.owner_id as account_id from public.projects
		where projects.id in (select my_projects.id from my_projects)
		union
		select project_members.account_id from public.project_members
		where project_members.project_id in (select my_projects.id from my_projects)
		union
		select organisation_members.account_id from public.organisation_members
		where organisation_members.organisation_id in (
			select my_organisations.organisation_id from my_organisations
		)
	)
	select profiles.id, profiles.email, profiles.display_name
	from colleagues
	join public.profiles on profiles.id = colleagues.account_id
	order by profiles.display_name, profiles.email;
$$;
revoke execute on function public.people_i_work_with() from anon;

create or replace function public.works_with(person uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
	select exists (select 1 from public.people_i_work_with() colleague where colleague.id = person);
$$;
revoke execute on function public.works_with(uuid) from anon;

drop policy if exists "people add to-dos for themselves or their projects" on public.todos;
drop policy if exists "people add to-dos for themselves, their colleagues or their projects" on public.todos;
create policy "people add to-dos for themselves, their colleagues or their projects" on public.todos
	for insert with check (
		created_by = auth.uid()
		and (project_id is null or public.can_reach_project(project_id))
		and (
			owner_account_id = auth.uid()
			or project_id is not null
			or public.works_with(owner_account_id)
		)
	);

commit;
