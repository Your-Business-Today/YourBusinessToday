import type { SupabaseClient } from '@supabase/supabase-js';
import { getAuthoredNotes, type AuthoredNote } from './authoredNotes';
import { getLinksForPeople, type PersonLink } from './getLinksForPeople';
import { parsePersonRecord, type Person } from './personRecord';

export type PersonInFull = Person & { links: PersonLink[]; notes: AuthoredNote[] };

export async function getPerson(supabase: SupabaseClient, personId: string): Promise<PersonInFull | null> {
	const { data, error } = await supabase.from('people').select('*').eq('id', personId).maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	const [links, notes] = await Promise.all([
		getLinksForPeople(supabase, [personId]),
		getAuthoredNotes(supabase, [personId])
	]);
	return { ...parsePersonRecord(data), links, notes };
}

export async function getPeopleInFull(supabase: SupabaseClient, people: Person[]): Promise<PersonInFull[]> {
	const personIds = people.map((person) => person.id);
	const [links, notes] = await Promise.all([
		getLinksForPeople(supabase, personIds),
		getAuthoredNotes(supabase, personIds)
	]);
	return people.map((person) => ({
		...person,
		links: links.filter((link) => link.personId === person.id),
		notes: notes.filter((note) => note.personId === person.id)
	}));
}
