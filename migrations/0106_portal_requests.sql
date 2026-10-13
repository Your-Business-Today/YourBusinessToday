-- 0106: a client contact follows the requests they raised on the portal.
--
-- A request a contact raises from the portal is a support task on the
-- project, created by them. Like 0100's views, these two open only what the
-- portal shows, on the contact's own account: each request they raised on
-- one of their client's projects (title, what they asked, its state and the
-- resolution it closed with), and the conversation on it without internal
-- notes. Raising and replying go through the site, which checks the contact
-- and every value before it writes.
--
-- Read-only views; safe to re-run.

begin;

drop view if exists public.portal_request_messages;
drop view if exists public.portal_requests;

create view public.portal_requests with (security_invoker = false, security_barrier = true) as
	select task.id, task.project_id, task.title, task.details, task.status, task.resolution, task.created_at
	from public.tasks as task
	where task.kind = 'support'
		and task.created_by = auth.uid()
		and public.is_client_contact_on_project(task.project_id);

create view public.portal_request_messages with (security_invoker = false, security_barrier = true) as
	select message.id, message.task_id, message.body, message.created_at,
		message.author_account_id = auth.uid() as is_from_visitor,
		coalesce(nullif(profile.display_name, ''), profile.email, '') as author_name
	from public.conversation_messages as message
	join public.tasks as task on task.id = message.task_id
	left join public.profiles as profile on profile.id = message.author_account_id
	where not message.is_internal
		and task.kind = 'support'
		and task.created_by = auth.uid()
		and public.is_client_contact_on_project(task.project_id);

revoke all on public.portal_requests, public.portal_request_messages from public, anon, authenticated;
grant select on public.portal_requests, public.portal_request_messages to authenticated;

commit;

notify pgrst, 'reload schema';
