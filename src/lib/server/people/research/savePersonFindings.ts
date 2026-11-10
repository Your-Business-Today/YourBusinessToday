import type { SupabaseClient } from '@supabase/supabase-js';
import { addPersonLink } from '../addPersonLink';
import { addPersonNote } from '../addPersonNote';
import { getLinksForPeople } from '../getLinksForPeople';
import { personNoteKinds } from '$lib/data/personNoteKind';
import { recordClientEvent } from '$lib/server/clients/recordClientEvent';
import { researchNoteBody } from './researchNoteBody';
import type { PersonCompany } from '../getCompaniesForPerson';
import type { PersonResearchFindings } from '$lib/data/personResearchRules';

const personResearched = 'person_researched';

/** Saves checked findings where the site keeps them: new links, the "Found on the web" note, and the research on each of their companies. */
export async function savePersonFindings(
	supabase: SupabaseClient,
	findings: PersonResearchFindings,
	personName: string,
	companies: PersonCompany[],
	actorAccountId: string
): Promise<number> {
	const heldUrls = new Set((await getLinksForPeople(supabase, [findings.personId])).map((link) => link.url));
	const newLinks = findings.links.filter((link) => !heldUrls.has(link.url));
	for (const link of newLinks) await addPersonLink(supabase, findings.personId, link);
	await addPersonNote(supabase, findings.personId, personNoteKinds.research, researchNoteBody(findings), actorAccountId);
	for (const company of companies) {
		await recordClientEvent(supabase, company.id, personResearched, { person: personName }, actorAccountId);
	}
	return newLinks.length;
}
