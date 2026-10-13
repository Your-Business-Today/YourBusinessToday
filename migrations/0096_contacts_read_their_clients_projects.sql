-- 0096: a client contact reads, and only reads, the projects YBT runs for
-- their organisation — the project, its goals and its tasks — so the client
-- portal lists them on the contact's own account, never the service key.
--
-- An account reaches a project here only when it has a client_contacts row
-- for that project's client; a project with no client is reached by nobody
-- this way. 0051 dropped 0034's company-wide read in favour of membership;
-- this brings company-wide reach back as read-only, beside membership, and
-- grants no insert, update or delete. Additive: no policy or data is dropped
-- beyond this migration's own, so it is safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

create or replace function public.is_client_contact_on_project(project uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
	select exists (
		select 1
		from projects
		join client_contacts on client_contacts.client_id = projects.client_id
		where projects.id = project
			and client_contacts.account_id = auth.uid()
	);
$$;

revoke execute on function public.is_client_contact_on_project(uuid) from anon;

drop policy if exists "client contacts read their client's projects" on public.projects;
create policy "client contacts read their client's projects" on public.projects
	for select using (public.is_client_contact_on_project(id));

drop policy if exists "client contacts read goals on their client's projects" on public.goals;
create policy "client contacts read goals on their client's projects" on public.goals
	for select using (public.is_client_contact_on_project(project_id));

drop policy if exists "client contacts read tasks on their client's projects" on public.tasks;
create policy "client contacts read tasks on their client's projects" on public.tasks
	for select using (public.is_client_contact_on_project(project_id));

commit;

notify pgrst, 'reload schema';
