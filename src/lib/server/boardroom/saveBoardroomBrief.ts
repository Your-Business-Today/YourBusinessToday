import type { SupabaseClient } from '@supabase/supabase-js';
import type { BoardBriefWords } from '$lib/data/boardroomBrief';
import type { BoardroomMeeting } from '$lib/data/boardroomMeeting';

/** Where a brief goes and whose it is: the meeting, the item on its agenda, the director's seat and account. */
export type BriefPlacing = {
	meeting: BoardroomMeeting;
	agendaItemId: string;
	seatId: string;
	writtenBy: string;
};

/** A brief as just kept: its id and the version the database gave it. */
export type SavedBrief = { briefId: string; version: number };

/** Keeps a new version of a director's brief on an item; the database numbers it after the last. */
export async function insertBoardroomBrief(
	supabase: SupabaseClient,
	placing: BriefPlacing,
	words: BoardBriefWords
): Promise<SavedBrief> {
	const { meeting } = placing;
	const row = {
		organisation_id: meeting.organisationId,
		meeting_id: meeting.id,
		agenda_item_id: placing.agendaItemId,
		director_id: placing.seatId,
		written_by: placing.writtenBy,
		position: words.position,
		may_share: words.mayShare,
		must_not_share: words.mustNotShare,
		must_come_back: words.mustComeBack
	};
	const { data, error } = await supabase.from('boardroom_briefs').insert(row).select('id, version').single();
	if (error) throw error;
	return { briefId: data.id as string, version: Number(data.version) };
}
