import type { SupabaseClient } from '@supabase/supabase-js';
import { getContactsForClient } from './getContactsForClient';
import { getPeopleInFull, type PersonInFull } from '$lib/server/people/getPerson';
import { parsePersonRecord } from '$lib/server/people/personRecord';
import type { ClientContact } from './clientContactRecord';

export type ClientPerson = PersonInFull & {
	contactId: string;
	role: string;
	officerRole: string;
	isPrimary: boolean;
	invitedAt: string | null;
	otherCompanyCount: number;
};

export async function getPeopleForClient(supabase: SupabaseClient, clientId: string): Promise<ClientPerson[]> {
	const contacts = await getContactsForClient(supabase, clientId);
	const personIds = contacts.map((contact) => contact.personId);
	const [people, companyCounts] = await Promise.all([
		getPeopleById(supabase, personIds),
		countCompaniesFor(supabase, personIds)
	]);
	const peopleInFull = await getPeopleInFull(supabase, people);
	return contacts.flatMap((contact) => {
		const person = peopleInFull.find((candidate) => candidate.id === contact.personId);
		if (person === undefined) return [];
		return [joinPersonToContact(person, contact, companyCounts.get(contact.personId) ?? 1)];
	});
}

function joinPersonToContact(person: PersonInFull, contact: ClientContact, companyCount: number): ClientPerson {
	return {
		...person,
		contactId: contact.id,
		role: contact.role,
		officerRole: contact.officerRole,
		isPrimary: contact.isPrimary,
		invitedAt: contact.invitedAt,
		otherCompanyCount: companyCount - 1
	};
}

async function getPeopleById(supabase: SupabaseClient, personIds: string[]) {
	if (personIds.length === 0) return [];
	const { data, error } = await supabase.from('people').select('*').in('id', personIds);
	if (error) throw error;
	return data.map(parsePersonRecord);
}

async function countCompaniesFor(supabase: SupabaseClient, personIds: string[]): Promise<Map<string, number>> {
	if (personIds.length === 0) return new Map();
	const { data, error } = await supabase.from('client_contacts').select('person_id').in('person_id', personIds);
	if (error) throw error;
	const counts = new Map<string, number>();
	for (const row of data as { person_id: string }[]) {
		counts.set(row.person_id, (counts.get(row.person_id) ?? 0) + 1);
	}
	return counts;
}
