import type { SupabaseClient } from '@supabase/supabase-js';
import { boardroomBriefColumns, parseBoardroomBriefRecord, parseBriefInRecord } from './boardroomBriefRecord';
import { sittingSeatOf } from '$lib/data/boardroomDirector';
import type { BoardroomBrief, BriefIn, MeetingBriefing } from '$lib/data/boardroomBrief';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';

/**
 * One director's own briefs on a meeting, every version. The site's client is held to them by row-level
 * security; the connector's service client is held to them by the seat named here, so nobody reads another's.
 */
export async function getOwnBriefsOfMeeting(
	supabase: SupabaseClient,
	meetingId: string,
	seatId: string
): Promise<BoardroomBrief[]> {
	const { data, error } = await supabase
		.from('boardroom_briefs')
		.select(boardroomBriefColumns)
		.eq('meeting_id', meetingId)
		.eq('director_id', seatId)
		.order('version', { ascending: true });
	if (error) throw error;
	return data.map(parseBoardroomBriefRecord);
}

/** Whose brief is in on each item of a meeting, and nothing of what any brief says. */
export async function getBriefsInOfMeeting(supabase: SupabaseClient, meetingId: string): Promise<BriefIn[]> {
	const { data, error } = await supabase.rpc('boardroom_briefs_in', { meeting: meetingId });
	if (error) throw error;
	return (data as Record<string, unknown>[]).map(parseBriefInRecord);
}

/** What one reader of a meeting knows of its briefs: their own, every version, and only whose others are in. */
export async function getMeetingBriefing(
	supabase: SupabaseClient,
	record: MeetingRecord,
	accountId: string
): Promise<MeetingBriefing> {
	const { meeting, directors } = record;
	const seat = sittingSeatOf(directors, accountId);
	const briefsIn = await getBriefsInOfMeeting(supabase, meeting.id);
	if (seat === null) return { seatId: null, ownBriefs: [], briefsIn };
	const ownBriefs = await getOwnBriefsOfMeeting(supabase, meeting.id, seat.id);
	return { seatId: seat.id, ownBriefs, briefsIn };
}
