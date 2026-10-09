import type { SupabaseClient } from '@supabase/supabase-js';
import { addClientContact } from './addClientContact';
import { createClient } from './createClient';
import { getContactsForClient } from './getContactsForClient';
import { recordClientEvent } from './recordClientEvent';
import { updateCompanyProfile } from './updateCompanyProfile';
import type { ReviewedLead } from './readResearchedLeadForm';
import type { ResearchedPerson } from './researchedProfile';

export async function saveResearchedLead(
	supabase: SupabaseClient,
	lead: ReviewedLead,
	actorAccountId: string
): Promise<string> {
	const { profile, people } = lead;
	const clientId = await placeOnRegister(supabase, lead, actorAccountId);
	const knownNames = await namesAlreadyListed(supabase, clientId);
	for (const person of people) {
		if (knownNames.has(person.name.toLowerCase())) continue;
		await addResearchedPerson(supabase, clientId, person, actorAccountId);
	}
	await recordClientEvent(
		supabase,
		clientId,
		'profile_researched',
		{ source: profile.sourceUrl, people: people.length },
		actorAccountId
	);
	return clientId;
}

async function placeOnRegister(
	supabase: SupabaseClient,
	lead: ReviewedLead,
	actorAccountId: string
): Promise<string> {
	if (lead.existingClientId === null) {
		return createClient(
			supabase,
			{ ...lead, ownerId: actorAccountId, source: 'research' },
			actorAccountId
		);
	}
	await updateCompanyProfile(supabase, lead.existingClientId, lead.website, lead.profile);
	return lead.existingClientId;
}

async function namesAlreadyListed(supabase: SupabaseClient, clientId: string): Promise<Set<string>> {
	const contacts = await getContactsForClient(supabase, clientId);
	return new Set(contacts.map((contact) => contact.name.toLowerCase()));
}

async function addResearchedPerson(
	supabase: SupabaseClient,
	clientId: string,
	person: ResearchedPerson,
	actorAccountId: string
): Promise<void> {
	await addClientContact(
		supabase,
		clientId,
		{ name: person.name, email: '', phone: '', role: person.role, isPrimary: false, sourceUrl: person.evidenceUrl },
		actorAccountId
	);
}
