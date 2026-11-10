export type ClientEventKind =
	| 'stage_moved'
	| 'contact_added'
	| 'contact_invited'
	| 'contact_removed'
	| 'administrator_changed'
	| 'project_assigned'
	| 'request_raised'
	| 'request_decided'
	| 'request_promoted'
	| 'build_dispatched'
	| 'build_live'
	| 'enquiry_received'
	| 'lead_added'
	| 'profile_researched'
	| 'approach_drafted'
	| 'person_added'
	| 'appointments_imported'
	| 'officers_imported'
	| 'grouped_under'
	| 'person_researched'
	| 'sighted'
	| 'client_set_up'
	| 'context_confirmed';

export type ClientEvent = {
	id: string;
	kind: ClientEventKind;
	detail: Record<string, unknown>;
	createdAt: string;
};
