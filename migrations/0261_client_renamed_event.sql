-- 0261: a company's name on the register can be corrected, and the correction is told on its history.
--
-- client_events gains the kind renamed, its detail the name before and the name after. The check is put back
-- from the newest migration that set it (0213) with every kind it held and renamed added last, so no row already
-- there changes or fails it, and running this again changes nothing.
--
-- Nothing else changes: the name's limit (160 characters, companyResearchLimits.longestName) is checked by the
-- service at every door that renames, and two companies may share a name, as they may when one is added.
--
-- Quick on the live site: client_events holds one short line for each thing that happened to a company, so
-- putting the check back reads few rows and takes a moment. The file gives up in seconds rather than hold the
-- site if it waits for the table's lock or runs long, as 0254 learned on 16/11/2026.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '1min';

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
		'owner_changed',
		'workflow_map_confirmed',
		'renamed'
	));

commit;
