import type { SupabaseClient } from '@supabase/supabase-js';
import { getNotesForPeople, type PersonNote } from './getNotesForPeople';
import { getStaffDirectory } from '$lib/server/projects/getStaffDirectory';

export type AuthoredNote = PersonNote & { authorName: string };

const unknownAuthor = 'Someone';

export async function getAuthoredNotes(
	supabase: SupabaseClient,
	personIds: string[]
): Promise<AuthoredNote[]> {
	const [notes, staffMembers] = await Promise.all([
		getNotesForPeople(supabase, personIds),
		getStaffDirectory(supabase)
	]);
	const authorNames = new Map(staffMembers.map((member) => [member.id, member.name]));
	return notes.map((note) => ({ ...note, authorName: authorNameFor(note, authorNames) }));
}

function authorNameFor(note: PersonNote, authorNames: Map<string, string>): string {
	if (note.authorId === null) return unknownAuthor;
	return authorNames.get(note.authorId) ?? unknownAuthor;
}
