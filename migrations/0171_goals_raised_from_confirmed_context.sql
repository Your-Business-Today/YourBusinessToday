-- 0171: a staff member's Claude raises the services we build from a client's confirmed company context, as goals on
-- the client's project, and each goal keeps the version of the context it came from.
--
-- goals gains context_version_id: the confirmed version a goal was raised from, empty for every goal raised any other
-- way, so no goal already there changes. A version is never deleted while its organisation stands; if one ever is,
-- the goal stays and only loses the link.
--
-- The client sees each goal on the portal through portal_goals (migration 0100). The view is put back with every
-- column it held, in the same order, and the number of the version a goal came from added last, so the portal can
-- link the goal back to the confirmed context. The view reads the version as its owner, as it reads the goal, so the
-- context's own tables keep row level security with no policy.
--
-- Additive and safe to re-run; the portal and the connector stand without it.

begin;

alter table public.goals
	add column if not exists context_version_id uuid references public.company_context_versions (id) on delete set null;

create index if not exists goals_context_version_id_idx on public.goals (context_version_id);

create or replace view public.portal_goals with (security_invoker = false, security_barrier = true) as
	select goal.id, goal.project_id, goal.title, goal.measure, goal.status, goal.horizon, goal.priority,
		version.version_number as context_version_number
	from public.goals as goal
	left join public.company_context_versions as version on version.id = goal.context_version_id
	where public.is_client_contact_on_project(goal.project_id);

revoke all on public.portal_goals from public, anon, authenticated;
grant select on public.portal_goals to authenticated;

commit;

notify pgrst, 'reload schema';
