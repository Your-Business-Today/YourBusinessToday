import type { SupabaseClient } from '@supabase/supabase-js';
import { addClientContact } from './addClientContact';
import { createClient } from './createClient';

export type LeadSeed = {
	name: string;
	website: string;
	ownerId: string;
	keptByOrganisationId: string;
	firstContactName: string;
	firstContactEmail: string;
};

export function readLeadSeed(formData: FormData, ownerId: string, keptByOrganisationId: string): LeadSeed | null {
	const name = String(formData.get('name') ?? '').trim();
	if (name === '') return null;
	return {
		name,
		website: String(formData.get('website') ?? '').trim(),
		ownerId,
		keptByOrganisationId,
		firstContactName: String(formData.get('contactName') ?? '').trim(),
		firstContactEmail: String(formData.get('contactEmail') ?? '').trim().toLowerCase()
	};
}

export async function addLead(
	supabase: SupabaseClient,
	seed: LeadSeed,
	actorAccountId: string
): Promise<string> {
	const clientId = await createClient(supabase, seed, actorAccountId);
	if (seed.firstContactName === '') return clientId;
	await addClientContact(
		supabase,
		clientId,
		{
			name: seed.firstContactName,
			email: seed.firstContactEmail,
			phone: '',
			role: '',
			isPrimary: true
		},
		actorAccountId
	);
	return clientId;
}
