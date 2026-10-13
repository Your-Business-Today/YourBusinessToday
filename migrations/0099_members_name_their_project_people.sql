-- 0099: a project member who is not staff can open a task again. The task page
-- names its message authors and uploaders through account_directory, which
-- raised staff_only for anyone but staff, so every task page failed with a 500
-- for a client or team member. Staff and the service role still name anyone;
-- anyone else names the people on the projects they can reach and the staff
-- who work them, and nobody else. Safe to re-run.

begin;

create or replace function public.account_directory(account_ids uuid[])
returns table (id uuid, email text, display_name text)
language plpgsql
stable
security definer
set search_path to 'public'
as $$
begin
	if public.is_project_manager() or auth.role() = 'service_role' then
		return query
			select profiles.id, profiles.email, profiles.display_name
			from public.profiles
			where profiles.id = any (account_ids);
		return;
	end if;
	if auth.uid() is null then
		raise exception 'not_signed_in';
	end if;
	return query
		select profiles.id, profiles.email, profiles.display_name
		from public.profiles
		where profiles.id = any (account_ids)
			and (
				profiles.id = auth.uid()
				or profiles.is_staff
				or profiles.is_admin
				or exists (
					select 1 from public.projects
					where projects.owner_id = profiles.id and public.can_reach_project(projects.id)
				)
				or exists (
					select 1 from public.project_members
					where project_members.account_id = profiles.id
						and public.can_reach_project(project_members.project_id)
				)
			);
end;
$$;
revoke execute on function public.account_directory(uuid[]) from anon;
grant execute on function public.account_directory(uuid[]) to authenticated, service_role;

commit;

notify pgrst, 'reload schema';
