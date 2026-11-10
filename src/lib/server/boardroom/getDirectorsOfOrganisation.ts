import type { SupabaseClient } from '@supabase/supabase-js';
import { boardroomDirectorColumns, parseBoardroomDirectorRecord } from './boardroomDirectorRecord';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { BoardroomDirector } from '$lib/data/boardroomDirector';

/** Everyone ever named to an organisation's board, sitting or stood down, in the order they were named; none until migration 0150 has run. */
export async function getDirectorsOfOrganisation(
	supabase: SupabaseClient,
	organisationId: string
): Promise<BoardroomDirector[]> {
	const { data, error } = await supabase
		.from('boardroom_directors')
		.select(boardroomDirectorColumns)
		.eq('organisation_id', organisationId)
		.order('named_at', { ascending: true });
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	return data.map(parseBoardroomDirectorRecord);
}
