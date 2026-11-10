import type { SupabaseClient } from '@supabase/supabase-js';
import { getMeetingRecord } from './readBoardroomMeeting';
import { describeBoardMinutes } from '$lib/data/describeBoardMinutes';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/**
 * A closed meeting's record and every version of its minutes. It reads the record without any director's brief,
 * steer notes or held pieces, so nothing private reaches the minutes, the minute-taker's own included.
 */
export async function readMinutesOfMeeting(supabase: SupabaseClient, organisation: Organisation, meetingId: string, now: Date): Promise<string> {
	const record = await getMeetingRecord(supabase, organisation.id, meetingId);
	if (record === null) return boardroomMeetingRefusals.noSuchMeeting;
	return describeBoardMinutes(organisation.name, record, now);
}
