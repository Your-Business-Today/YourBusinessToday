import type { SupabaseClient } from '@supabase/supabase-js';
import { getMeetingRecord } from './readBoardroomMeeting';
import { insertBoardroomRoom } from './saveBoardroomRoom';
import { getRoomOfMeeting } from './getBoardroomRoom';
import { meetingStage, meetingStages } from '$lib/data/boardroomMeeting';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import { boardRoomRefusals } from '$lib/data/boardroomRoomRules';
import { seatInRoom } from '$lib/data/boardroomRoomTurns';
import { openRoomOf } from '$lib/data/boardroomRoom';
import { roomOpenedWords } from '$lib/data/describeBoardroomRoom';
import type { BoardroomDirector } from '$lib/data/boardroomDirector';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';
import type { RoomCaller } from '$lib/data/placeBoardContribution';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** The seat opening the room, or why the room cannot open: closed, not yet its time, or the caller is not on it. */
export function seatOpeningRoom(record: MeetingRecord, caller: RoomCaller): BoardroomDirector | string {
	if (meetingStage(record.meeting, caller.now) === meetingStages.closed) return boardRoomRefusals.meetingHasClosed;
	const { meeting } = record;
	const meetsAt = new Date(meeting.meetsAt).getTime();
	if (meetsAt > caller.now.getTime()) return boardRoomRefusals.meetingNotYetTime;
	return seatInRoom(record, caller.accountId, caller.now) ?? boardRoomRefusals.callerNotOnMeeting;
}

/** Opens a meeting's room for its directors' Claudes, from the meeting's time, once; opening it opens the meeting. */
export async function openBoardroomRoom(
	supabase: SupabaseClient,
	organisation: Organisation,
	meetingId: string,
	roundsLimit: number,
	caller: RoomCaller
): Promise<string> {
	const record = await getMeetingRecord(supabase, organisation.id, meetingId);
	if (record === null) return boardroomMeetingRefusals.noSuchMeeting;
	const openRoom = openRoomOf(record.room);
	if (openRoom !== null) return roomOpenedWords(openRoom.roundsLimit, false);
	const seat = seatOpeningRoom(record, caller);
	if (typeof seat === 'string') return seat;
	const opening = { meeting: record.meeting, seatId: seat.id, openedBy: caller.accountId, roundsLimit };
	const isNewlyOpened = await insertBoardroomRoom(supabase, opening);
	if (isNewlyOpened) return roomOpenedWords(roundsLimit, true);
	const openedMeanwhile = await getRoomOfMeeting(supabase, meetingId);
	const roomOpenedMeanwhile = openRoomOf(openedMeanwhile);
	return roomOpenedWords(roomOpenedMeanwhile?.roundsLimit ?? roundsLimit, false);
}
