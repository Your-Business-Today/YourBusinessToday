-- 0255: the connector can ask who a named person works with.
--
-- people_i_work_with() answers for auth.uid(), the signed-in person. The connector calls the
-- database as the service role, where auth.uid() is null, so it answered nobody and add_todo
-- refused every colleague's list (task 33d9f734, 16 Nov 2026: James could not put a to-do on
-- Nigel's list although they share the Your Business Today organisation and its projects).
--
-- people_working_with(member) answers for the person named, and only for the signed-in person
-- themselves or for the service role, as team_projects(member) does. people_i_work_with() now
-- reads it, so the two can never disagree.
--
-- Additive and safe to re-run. Nothing is dropped.

begin;

create or replace function public.people_working_with(member uuid default auth.uid())
returns table (id uuid, email text, display_name text)
language plpgsql
stable
security definer
set search_path to 'public'
as $$
begin
	if not (member = auth.uid() or auth.role() = 'service_role') then
		raise exception 'not_your_colleagues';
	end if;
	return query
		with member_projects as (
			select projects.id from public.projects where projects.owner_id = member
			union
			select project_members.project_id from public.project_members
			where project_members.account_id = member
		),
		member_organisations as (
			select organisation_members.organisation_id from public.organisation_members
			where organisation_members.account_id = member
		),
		colleagues as (
			select projects.owner_id as account_id from public.projects
			where projects.id in (select member_projects.id from member_projects)
			union
			select project_members.account_id from public.project_members
			where project_members.project_id in (select member_projects.id from member_projects)
			union
			select organisation_members.account_id from public.organisation_members
			where organisation_members.organisation_id in (
				select member_organisations.organisation_id from member_organisations
			)
		)
		select profiles.id, profiles.email, profiles.display_name
		from colleagues
		join public.profiles on profiles.id = colleagues.account_id
		order by profiles.display_name, profiles.email;
end;
$$;
revoke execute on function public.people_working_with(uuid) from anon;

create or replace function public.people_i_work_with()
returns table (id uuid, email text, display_name text)
language sql
stable
security definer
set search_path to 'public'
as $$
	select colleague.id, colleague.email, colleague.display_name
	from public.people_working_with(auth.uid()) colleague;
$$;
revoke execute on function public.people_i_work_with() from anon;

commit;
