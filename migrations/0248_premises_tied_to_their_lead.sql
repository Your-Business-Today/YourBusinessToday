-- 0248: a staff member's page ties a premises to the lead made from it.
--
-- Add as lead, on a territory's map, makes a client from a premises and then
-- ties the two by setting premises.client_id. The page runs as the signed-in
-- staff member, and premises lets a project manager read it and nothing else
-- (0089: the one policy, "project managers read premises"). An update no
-- policy allows changes no row and raises no error, so the lead was made, the
-- page said so, and the premises stayed tied to nobody: the button was still
-- there, and pressing it again made a second lead for the same business. On a
-- scratch database built from staging on 15 Nov 2026, a project manager's
-- update stamped 0 rows. Through the connector the same code runs as the
-- service role, so there the tie was made.
--
-- tie_premises_to_client is the one door for it. It lets in a project manager
-- or the service role, changes that one column and no other, and ties only a
-- premises tied to nobody, so a lead is never taken from the client it has.
-- A premises it cannot tie is refused by name, never passed over in silence.
--
-- Adds one function; no table, column, policy or row is touched and nothing
-- is dropped. Safe to re-run.

begin;

create or replace function public.tie_premises_to_client(premises_id uuid, lead_client_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if not (public.is_project_manager() or auth.role() = 'service_role') then
		raise exception 'Only staff and the service role tie a premises to a lead' using errcode = '42501';
	end if;
	update public.premises
	set client_id = lead_client_id
	where id = premises_id and client_id is null;
	if not found then
		raise exception 'That premises is not held, or is a lead already, so nothing was tied.' using errcode = 'P0002';
	end if;
end;
$$;

commit;

notify pgrst, 'reload schema';
