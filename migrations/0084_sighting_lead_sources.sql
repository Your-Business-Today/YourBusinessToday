-- 0084: a lead can arrive from a sighting a person's Claude made on the open
-- web, from a food hygiene record, or from a places dataset, and the ledger
-- says when a sighting became a lead. The three sources land together so
-- the premises and places steps rewrite no constraint. Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

alter table public.clients drop constraint if exists clients_lead_source_check;
alter table public.clients add constraint clients_lead_source_check
	check (lead_source in ('staff', 'website', 'research', 'companies_house', 'sighting', 'food_hygiene', 'places_dataset'));

alter table public.people drop constraint if exists people_lead_source_check;
alter table public.people add constraint people_lead_source_check
	check (lead_source in ('staff', 'website', 'research', 'companies_house', 'sighting', 'food_hygiene', 'places_dataset'));

alter table public.client_events drop constraint if exists client_events_kind_check;
alter table public.client_events add constraint client_events_kind_check
	check (kind in (
		'stage_moved',
		'contact_added',
		'contact_invited',
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
