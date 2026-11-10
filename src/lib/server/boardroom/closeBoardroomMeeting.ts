import type { SupabaseClient } from '@supabase/supabase-js';
import { getMeetingRecord } from './readBoardroomMeeting';
import { insertMeetingClosing } from './saveBoardroomMinutes';
import { placeMeetingClose } from '$lib/data/placeMeetingClose';
import { closeWaitsForWordWords, meetingClosedWords } from '$lib/data/describeMinutesKept';
import { boardMinutesRefusals } from '$lib/data/boardroomMinutesRules';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import type { MeetingCloseDraft } from '$lib/data/validateMeetingClose';
import type { RoomCaller } from '$lib/data/placeBoardContribution';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import type { SeatAnswer } from './steerOwnClaude';

const refused = (answer: string): SeatAnswer => ({ answer, isKept: false });

/**
 * The minute-taker closes an open meeting, once. Closing cannot be undone and ends the taking of answers, so while
 * an item has not come out of the room or a decision still waits, it closes only on the chair's word to close with
 * them waiting. A decision still waiting is then settled from the answers given; closing writes no outcome.
 */
export async function closeBoardroomMeeting(
	supabase: SupabaseClient,
	organisation: Organisation,
	meetingId: string,
	draft: MeetingCloseDraft,
	caller: RoomCaller
): Promise<SeatAnswer> {
	const record = await getMeetingRecord(supabase, organisation.id, meetingId);
	if (record === null) return refused(boardroomMeetingRefusals.noSuchMeeting);
	const place = placeMeetingClose(record, caller);
	if (typeof place === 'string') return refused(place);
	const { waiting } = place;
	const isWaitingForWord = waiting.length > 0 && !draft.isClosingWithItemsWaiting;
	const waitingWords = closeWaitsForWordWords(waiting, record.directors);
	if (isWaitingForWord) return refused(waitingWords);
	const placing = { meeting: record.meeting, seatId: place.seatId, givenBy: caller.accountId };
	const isClosed = await insertMeetingClosing(supabase, placing);
	if (!isClosed) return refused(boardMinutesRefusals.meetingNotOpen);
	return { answer: meetingClosedWords, isKept: true };
}
