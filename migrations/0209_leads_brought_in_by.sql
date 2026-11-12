-- 0209: every record on a sales register names who brought it in.
--
-- James, 12 Nov 2026: "we need to see sales leads and ultimately sales by
-- people too, like nigel has all the leads, cos he knows people". The record
-- already carries clients.owner_id, set to whoever added it; the site and the
-- connector now show it as "Brought in by", let staff change it, and count
-- leads and won sales by it on the Sales leaderboard.
--
-- Changing who brought a record in is kept on its history: client_events gains
-- the kind owner_changed. The check is put back with every kind it held
-- before, so no row already there changes or fails it.
--
-- Every lead Your Business Today keeps today (the eight Nigel introduced and
-- Prentice Glass) was brought in by Nigel, whoever typed it in, so each is set
-- to him and the change is written on its history. A database without his
-- account (a scratch rehearsal) is left as it is. Signed clients are left with
-- whoever they name now.
--
-- Safe to re-run: the check is replaced whole, and a record already naming
-- Nigel is neither changed nor given a second history line. Nothing is
-- dropped, renamed or deleted.

begin;

alter table public.client_events drop constraint if exists client_events_kind_check;
alter table public.client_events add constraint client_events_kind_check
	check (kind in (
		'stage_moved',
		'contact_added',
		'contact_invited',
		'contact_removed',
		'administrator_changed',
		'project_assigned',
		'request_raised',
		'request_decided',
		'request_promoted',
		'build_dispatched',
		'build_live',
		'enquiry_received',
		'lead_added',
		'profile_researched',
		'approach_drafted',
		'person_added',
		'appointments_imported',
		'officers_imported',
		'grouped_under',
		'person_researched',
		'sighted',
		'client_set_up',
		'context_confirmed',
		'owner_changed'
	));

with nigel as (
	select id, coalesce(nullif(trim(display_name), ''), email) as name
	from public.profiles
	where id = '40a1cc88-0a01-4c67-88cb-ffa343c76ac2'
),
leads_to_give_nigel as (
	select clients.id
	from public.clients
	where clients.kept_by_organisation_id = public.your_business_today_organisation_id()
		and clients.lifecycle_stage in ('lead', 'prospect', 'lost')
		and clients.owner_id is distinct from (select id from nigel)
		and exists (select 1 from nigel)
),
given as (
	update public.clients
		set owner_id = (select id from nigel)
		from leads_to_give_nigel
		where clients.id = leads_to_give_nigel.id
		returning clients.id
)
insert into public.client_events (client_id, kind, detail, actor_account_id)
select given.id, 'owner_changed', jsonb_build_object('to', (select name from nigel)), null
from given;

commit;
