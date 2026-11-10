import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { parseBoardroomRecordPaperRecord } from './boardroomRecordPaperRecord';
import type { BoardroomRecordPaper } from '$lib/data/boardroomRecordPaper';

export const recordPapersTable = 'boardroom_record_papers';

/** Every paper taken from the records for one meeting's agenda, in the order taken; none until migration 0162 has run. */
export async function getRecordPapersOfMeeting(supabase: SupabaseClient, meetingId: string): Promise<BoardroomRecordPaper[]> {
	const { data, error } = await supabase
		.from(recordPapersTable)
		.select('*')
		.eq('meeting_id', meetingId)
		.order('created_at', { ascending: true });
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	return data.map(parseBoardroomRecordPaperRecord);
}

/** One paper taken from an organisation's records for its board, or null when it has none with that id. */
export async function getBoardroomRecordPaper(
	supabase: SupabaseClient,
	organisationId: string,
	paperId: string
): Promise<BoardroomRecordPaper | null> {
	const { data, error } = await supabase
		.from(recordPapersTable)
		.select('*')
		.eq('organisation_id', organisationId)
		.eq('id', paperId)
		.maybeSingle();
	if (isSchemaNotYetMigrated(error)) return null;
	if (error) throw error;
	if (data === null) return null;
	return parseBoardroomRecordPaperRecord(data);
}
