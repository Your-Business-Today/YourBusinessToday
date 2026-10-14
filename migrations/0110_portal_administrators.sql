-- 0110: a client organisation's administrators manage its people on the portal.
--
-- A client contact may now be an administrator of their organisation's
-- portal: they invite and remove its people and say who else is an
-- administrator. Each organisation's primary contact starts as its
-- administrator, so every organisation with a primary contact has one from
-- the start; staff name one for any organisation that has none.
--
-- Removing a person and changing who is an administrator are recorded on the
-- client's history as contact_removed and administrator_changed.
--
-- Additive only: one new column, defaulting to false, and two new event kinds.
-- The primary contacts are made administrators only where their organisation
-- has none yet, so running it again changes nothing.

begin;

alter table public.client_contacts
	add column if not exists is_portal_administrator boolean not null default false;

update public.client_contacts as contact
set is_portal_administrator = true
where contact.is_primary
	and not exists (
		select 1
		from public.client_contacts as other
		where other.client_id = contact.client_id
			and other.is_portal_administrator
	);

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
		'sighted'
	));

commit;

notify pgrst, 'reload schema';
