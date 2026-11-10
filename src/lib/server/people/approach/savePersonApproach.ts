import type { SupabaseClient } from '@supabase/supabase-js';
import { addPersonNote } from '../addPersonNote';
import { approachNoteBody } from './approachNoteBody';
import { personNoteKinds } from '$lib/data/personNoteKind';
import { recordClientEvent } from '$lib/server/clients/recordClientEvent';
import type { PersonApproach } from '$lib/data/personApproachRules';
import type { PersonCompany } from '../getCompaniesForPerson';

const approachDrafted = 'approach_drafted';

/** Saves a checked approach where the site keeps it: a "Drafted approach" note on the person, and the draft on each of their companies. */
export async function savePersonApproach(
	supabase: SupabaseClient,
	approach: PersonApproach,
	personName: string,
	companies: PersonCompany[],
	actorAccountId: string
): Promise<void> {
	await addPersonNote(supabase, approach.personId, personNoteKinds.approach, approachNoteBody(approach), actorAccountId);
	for (const company of companies) {
		await recordClientEvent(supabase, company.id, approachDrafted, { person: personName }, actorAccountId);
	}
}
