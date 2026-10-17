-- 0112: one person may be a client contact at several organisations.
--
-- An account can hold a contact row at more than one client, and the portal
-- lets them switch between those organisations. The older policies asked
-- client_id_for_account(), which reads one of the account's contacts and so
-- picked one organisation at random for a person at two. They now ask
-- is_contact_at_client(), which is true for every organisation the account is
-- a contact at, and no other.
--
-- Additive: one new function, and the same five policies recreated with it.
-- client_id_for_account() stays, unused, so nothing that names it breaks.
-- Safe to run twice.

begin;

create or replace function public.is_contact_at_client(client uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
	select exists (
		select 1 from client_contacts
		where client_id = client and account_id = auth.uid()
	);
$$;

revoke execute on function public.is_contact_at_client(uuid) from public, anon;
grant execute on function public.is_contact_at_client(uuid) to authenticated;

drop policy if exists "contacts read their own requests" on public.feature_requests;
create policy "contacts read their own requests" on public.feature_requests
	for select using (
		exists (
			select 1 from public.projects
			where projects.id = feature_requests.project_id
				and public.is_contact_at_client(projects.client_id)
		)
	);

drop policy if exists "contacts read comments on their own requests" on public.feature_request_comments;
create policy "contacts read comments on their own requests" on public.feature_request_comments
	for select using (
		exists (
			select 1 from public.feature_requests
			join public.projects on projects.id = feature_requests.project_id
			where feature_requests.id = feature_request_comments.request_id
				and public.is_contact_at_client(projects.client_id)
		)
	);

drop policy if exists "contacts raise their own requests" on public.feature_requests;
create policy "contacts raise their own requests" on public.feature_requests
	for insert with check (
		raised_by_contact_id in (
			select id from public.client_contacts where account_id = auth.uid()
		)
		and exists (
			select 1 from public.projects
			where projects.id = feature_requests.project_id
				and public.is_contact_at_client(projects.client_id)
		)
	);

drop policy if exists "contacts comment on their own requests" on public.feature_request_comments;
create policy "contacts comment on their own requests" on public.feature_request_comments
	for insert with check (
		author_account_id = auth.uid()
		and exists (
			select 1 from public.feature_requests
			join public.projects on projects.id = feature_requests.project_id
			where feature_requests.id = feature_request_comments.request_id
				and public.is_contact_at_client(projects.client_id)
		)
	);

drop policy if exists "contacts record raising a request" on public.client_events;
create policy "contacts record raising a request" on public.client_events
	for insert with check (
		kind = 'request_raised'
		and public.is_contact_at_client(client_id)
		and actor_account_id = auth.uid()
	);

commit;

notify pgrst, 'reload schema';
