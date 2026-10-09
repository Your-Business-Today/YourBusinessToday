import type { SupabaseClient } from '@supabase/supabase-js';
import type { PersonNoteKind } from './addPersonNote';

export type PersonNote = {
	id: string;
	personId: string;
	authorId: string | null;
	kind: PersonNoteKind;
	body: string;
	createdAt: string;
};

export async function getNotesForPeople(supabase: SupabaseClient, personIds: string[]): Promise<PersonNote[]> {
	if (personIds.length === 0) return [];
	const { data, error } = await supabase
		.from('person_notes')
		.select('id, person_id, author_id, kind, body, created_at')
		.in('person_id', personIds)
		.order('created_at', { ascending: false });
	if (error) throw error;
	return data.map((row: Record<string, unknown>) => ({
		id: row.id as string,
		personId: row.person_id as string,
		authorId: (row.author_id ?? null) as string | null,
		kind: row.kind as PersonNoteKind,
		body: row.body as string,
		createdAt: row.created_at as string
	}));
}
