import type { SupabaseClient } from '@supabase/supabase-js';
import { addPerson } from '$lib/server/people/addPerson';
import { affiliatePersonWithClient, affiliationOutcomes } from './affiliatePersonWithClient';
import { recordClientEvent } from './recordClientEvent';

export type NewContactSeed = {
	name: string;
	email: string;
	phone: string;
	role: string;
	isPrimary: boolean;
	sourceUrl?: string;
};

export type AddContactOutcome = 'added' | 'already_known';

export const addContactOutcomes = { added: 'added', alreadyKnown: 'already_known' } as const;

export function readNewContactSeed(formData: FormData): NewContactSeed | null {
	const name = String(formData.get('name') ?? '').trim();
	if (name === '') return null;
	return {
		name,
		email: String(formData.get('email') ?? '').trim().toLowerCase(),
		phone: String(formData.get('phone') ?? '').trim(),
		role: String(formData.get('role') ?? '').trim(),
		isPrimary: formData.get('isPrimary') === 'on'
	};
}

export async function addClientContact(
	supabase: SupabaseClient,
	clientId: string,
	seed: NewContactSeed,
	actorAccountId: string
): Promise<AddContactOutcome> {
	const { personId } = await addPerson(supabase, {
		name: seed.name,
		email: seed.email,
		phone: seed.phone,
		seniority: '',
		sourceUrl: seed.sourceUrl
	});
	const outcome = await affiliatePersonWithClient(supabase, {
		personId,
		clientId,
		role: seed.role,
		isPrimary: seed.isPrimary
	});
	if (outcome === affiliationOutcomes.alreadyAffiliated) return addContactOutcomes.alreadyKnown;
	await recordClientEvent(supabase, clientId, 'contact_added', { name: seed.name, email: seed.email }, actorAccountId);
	return 'added';
}
