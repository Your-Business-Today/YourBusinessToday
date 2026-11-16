import type { SupabaseClient } from '@supabase/supabase-js';
import { getPerson } from '$lib/server/people/getPerson';
import { profileEditOf, updatePersonProfile } from '$lib/server/people/updatePersonProfile';
import type { PersonFieldChanges } from '$lib/data/validatePersonFields';

/** Marks the person an email went to as contacted that day, with the next step when one was given. */
export async function recordContactAfterEmail(
	supabase: SupabaseClient,
	personId: string,
	sentOn: string,
	nextStep: PersonFieldChanges
): Promise<void> {
	const person = await getPerson(supabase, personId);
	if (person === null) return;
	await updatePersonProfile(supabase, person.id, { ...profileEditOf(person), lastContactedOn: sentOn, ...nextStep });
}
