import type { SupabaseClient } from '@supabase/supabase-js';
import { parseBoardroomPaperRecord } from './boardroomPaperRecord';
import type { BoardroomPaper } from '$lib/data/boardroomPaper';

/** Every paper kept on one meeting's agenda, files that have arrived and notes, in the order they were added. */
export async function getKeptPapersOfMeeting(supabase: SupabaseClient, meetingId: string): Promise<BoardroomPaper[]> {
	const { data, error } = await supabase
		.from('boardroom_agenda_papers')
		.select('*')
		.eq('meeting_id', meetingId)
		.not('recorded_at', 'is', null)
		.order('created_at', { ascending: true });
	if (error) throw error;
	return data.map(parseBoardroomPaperRecord);
}

/** One paper on an organisation's board, kept or still being sent, or null when it has none with that id. */
export async function getBoardroomPaper(
	supabase: SupabaseClient,
	organisationId: string,
	paperId: string
): Promise<BoardroomPaper | null> {
	const { data, error } = await supabase
		.from('boardroom_agenda_papers')
		.select('*')
		.eq('organisation_id', organisationId)
		.eq('id', paperId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseBoardroomPaperRecord(data);
}
