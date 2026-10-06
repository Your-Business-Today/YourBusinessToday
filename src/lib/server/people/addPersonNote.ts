import type { SupabaseClient } from '@supabase/supabase-js';

import type { PersonNoteKind } from '$lib/data/personNoteKind';

export type { PersonNoteKind };

export async function addPersonNote(
	supabase: SupabaseClient,
	personId: string,
	kind: PersonNoteKind,
	body: string,
	authorId: string
): Promise<void> {
	const { error } = await supabase
		.from('person_notes')
		.insert({ person_id: personId, kind, body, author_id: authorId });
	if (error) throw error;
}
