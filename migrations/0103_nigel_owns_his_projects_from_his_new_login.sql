-- 0103: Nigel Reilly owns his projects from the login he signs in with now.
--
-- Nigel's projects were still owned by his old login,
-- nigel.reilly@jewelgroup.co.uk, while he signs in as
-- nigel.reilly@jewelenterprises.co.uk. Each project the old login owns is
-- handed to the new one through transfer_project_ownership, as an owner
-- hands it on from the project page: the new login joins it as a member,
-- takes ownership, and the old login stays on it as a member. Nothing is
-- deleted; the projects join the bottom of the new login's board and queue.
--
-- When either login has no account nothing is moved.
-- Safe to re-run: once moved, the old login owns nothing to move.

begin;

do $$
declare
	old_login uuid;
	new_login uuid;
	owned record;
begin
	select id into old_login from public.profiles
	where lower(email) = 'nigel.reilly@jewelgroup.co.uk' limit 1;
	select id into new_login from public.profiles
	where lower(email) = 'nigel.reilly@jewelenterprises.co.uk' limit 1;
	if old_login is null or new_login is null then
		raise notice 'Nigel''s old or new login has no account: nothing moved';
		return;
	end if;
	perform set_config('request.jwt.claim.role', 'service_role', true);
	perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
	for owned in
		select id, name from public.projects where owner_id = old_login order by priority
	loop
		insert into public.project_members (project_id, account_id, added_by)
		values (owned.id, new_login, old_login)
		on conflict do nothing;
		perform public.transfer_project_ownership(owned.id, new_login);
		raise notice 'Moved % to Nigel''s new login', owned.name;
	end loop;
end;
$$;

commit;
