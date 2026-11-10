-- 0147: a client's history records the day an administrator set it up.
--
-- Nobody signs themselves up any more: an administrator sets a client
-- already on the register up from its page, or through the connector, with
-- its organisation and its first people. That step is recorded on the
-- client's history as client_set_up, beside a contact_invited for each
-- person sent their link.
--
-- Additive only: the kinds a history row may be gain one. The check is put
-- back with every kind it held before, so no row already there changes or
-- fails it, and running this again changes nothing.

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
		'client_set_up'
	));

commit;

notify pgrst, 'reload schema';
