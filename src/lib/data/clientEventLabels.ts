import type { ClientEventKind } from '$lib/server/clients/clientEventRecord';

export const clientEventLabels: Record<ClientEventKind, string> = {
	stage_moved: 'Stage moved',
	contact_added: 'Contact added',
	contact_invited: 'Contact invited',
	contact_removed: 'Contact removed',
	administrator_changed: 'Portal administrator changed',
	project_assigned: 'Project assigned',
	request_raised: 'Support task raised',
	request_decided: 'Support task resolved',
	request_promoted: 'Request promoted to a task',
	build_dispatched: 'Sent to the Builder',
	build_live: 'Build went live',
	enquiry_received: 'Enquiry received',
	lead_added: 'Lead added',
	profile_researched: 'Profile researched',
	approach_drafted: 'Approach drafted',
	person_added: 'Person added',
	appointments_imported: 'Imported from their appointments',
	officers_imported: 'Officers imported',
	grouped_under: 'Grouped under',
	person_researched: 'Person found on the web',
	sighted: 'Sighted on the web'
};
