import type { SupabaseClient } from '@supabase/supabase-js';
import { getBriefedMeetingRecord } from './readBoardroomMeeting';
import { standingAgenda } from '$lib/data/boardroomMeeting';
import { emptyMeetingRoom, outcomeOfItem } from '$lib/data/boardroomRoom';
import { itemTalkOf, seatInRoom } from '$lib/data/boardroomRoomTurns';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import { boardRoomRefusals } from '$lib/data/boardroomRoomRules';
import { describeBoardItem } from '$lib/data/describeBoardItem';
import type { RoomCaller } from '$lib/data/placeBoardContribution';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/**
 * One agenda item as a director's Claude reads it in the room: its papers, its own director's brief (read only
 * through getBoardroomBriefs, for the caller's own seat), everything said on it so far, and where it stands.
 */
export async function readItemInTheRoom(
	supabase: SupabaseClient,
	organisation: Organisation,
	meetingId: string,
	itemNumber: number,
	caller: RoomCaller
): Promise<string> {
	const record = await getBriefedMeetingRecord(supabase, organisation.id, meetingId, caller.accountId);
	if (record === null) return boardroomMeetingRefusals.noSuchMeeting;
	const item = standingAgenda(record.items)[itemNumber - 1];
	if (item === undefined) return boardRoomRefusals.itemNotOnAgenda;
	const talk = itemTalkOf(record, item, caller.now);
	const outcome = outcomeOfItem(record.room ?? emptyMeetingRoom, item.id);
	const seat = seatInRoom(record, caller.accountId, caller.now);
	const seatId = seat === null ? null : seat.id;
	return describeBoardItem(organisation.name, { record, item, itemNumber, talk, outcome, seatId });
}
