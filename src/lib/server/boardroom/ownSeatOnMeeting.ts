import type { SupabaseClient } from '@supabase/supabase-js';
import { getMeetingRecord } from './readBoardroomMeeting';
import { meetingStage, meetingStages } from '$lib/data/boardroomMeeting';
import { seatInRoom } from '$lib/data/boardroomRoomTurns';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import { seatControlRefusals } from '$lib/data/boardroomSeatControlRules';
import type { RoomCaller } from '$lib/data/placeBoardContribution';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';
import type { SeatPlacing } from './saveBoardroomSeatControls';

/** The meeting, and the caller's own seat on it as everything they tell their Claude is placed. */
export type OwnSeat = { record: MeetingRecord; placing: SeatPlacing };

/**
 * The caller's own seat on a meeting that has not closed, found from their account alone: nobody names a
 * seat, so nobody steers, pauses or answers for another director's Claude. Or why there is none.
 */
export async function findOwnSeatOnMeeting(
	supabase: SupabaseClient,
	organisationId: string,
	meetingId: string,
	caller: RoomCaller
): Promise<OwnSeat | string> {
	const record = await getMeetingRecord(supabase, organisationId, meetingId);
	if (record === null) return boardroomMeetingRefusals.noSuchMeeting;
	if (meetingStage(record.meeting, caller.now) === meetingStages.closed) return seatControlRefusals.meetingHasClosed;
	const seat = seatInRoom(record, caller.accountId, caller.now);
	if (seat === null) return seatControlRefusals.callerHasNoSeat;
	return { record, placing: { meeting: record.meeting, seatId: seat.id, givenBy: caller.accountId } };
}
