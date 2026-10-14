import type { SupabaseClient } from '@supabase/supabase-js';

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
	| 'sighted';

export type ClientEvent = {
	id: string;
	kind: ClientEventKind;
	detail: Record<string, unknown>;
	createdAt: string;
};

export async function recordClientEvent(
	supabase: SupabaseClient,
	clientId: string,
	kind: ClientEventKind,
	detail: Record<string, unknown>,
	actorAccountId: string | null
): Promise<void> {
	const { error } = await supabase.from('client_events').insert({
		client_id: clientId,
		kind,
		detail,
		actor_account_id: actorAccountId
	});
	if (error) throw error;
}
