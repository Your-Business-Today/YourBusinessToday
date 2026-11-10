import type { SupabaseClient } from '@supabase/supabase-js';
import { getMeetingRecord } from './readBoardroomMeeting';
import { raiseBoardActions } from './raiseBoardActions';
import { actionsNotOnTheirBoard, actionsToRaise } from '$lib/data/carriedActions';
import { actionsRaisedWords } from '$lib/data/describeRaisedAction';
import { boardActionRefusals } from '$lib/data/boardroomActionRules';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import { seatInRoom } from '$lib/data/boardroomRoomTurns';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';
import type { RoomCaller } from '$lib/data/placeBoardContribution';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import type { SeatAnswer } from './steerOwnClaude';

/** The meeting as it stands after an answer or a close, and what was raised from it, in words. */
export type RaisedAfter = { record: MeetingRecord; words: string };

/**
 * After an answer that completes a decision, or the close that settles one: the meeting read again, and every
 * action of a carried decision not yet raised raised now, as the answering or closing director.
 */
export async function raiseCarriedActions(supabase: SupabaseClient, organisation: Organisation, record: MeetingRecord, caller: RoomCaller): Promise<RaisedAfter> {
	const { meeting } = record;
	const after = (await getMeetingRecord(supabase, organisation.id, meeting.id)) ?? record;
	const toRaise = actionsToRaise(after, caller.now);
	if (toRaise.length === 0) return { record: after, words: '' };
	const occasion = { meeting: after.meeting, organisationName: organisation.name, raisedBy: caller.accountId };
	const { raised, notRaised } = await raiseBoardActions(supabase, after, occasion, toRaise);
	return { record: after, words: actionsRaisedWords(raised, notRaised) };
}

/**
 * A director asks for the actions of the meeting's carried decisions to be raised: any not raised yet, and any
 * raised whose task or to-do is not on its board, made again with the id its raising holds. Only on their ask.
 */
export async function raiseActionsWhenAsked(supabase: SupabaseClient, organisation: Organisation, meetingId: string, caller: RoomCaller): Promise<SeatAnswer> {
	const record = await getMeetingRecord(supabase, organisation.id, meetingId);
	if (record === null) return { answer: boardroomMeetingRefusals.noSuchMeeting, isKept: false };
	if (seatInRoom(record, caller.accountId, caller.now) === null) return { answer: boardActionRefusals.callerHasNoSeat, isKept: false };
	const toRaise = [...actionsToRaise(record, caller.now), ...actionsNotOnTheirBoard(record, caller.now)];
	if (toRaise.length === 0) return { answer: boardActionRefusals.nothingToRaise, isKept: false };
	const occasion = { meeting: record.meeting, organisationName: organisation.name, raisedBy: caller.accountId };
	const { raised, notRaised } = await raiseBoardActions(supabase, record, occasion, toRaise);
	return { answer: actionsRaisedWords(raised, notRaised).trim(), isKept: raised.length > 0 };
}
