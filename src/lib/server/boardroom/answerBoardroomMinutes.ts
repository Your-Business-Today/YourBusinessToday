import type { SupabaseClient } from '@supabase/supabase-js';
import { getMeetingRecord } from './readBoardroomMeeting';
import { insertMinutesAnswer } from './saveBoardroomMinutes';
import { placeMinutesAnswer } from '$lib/data/placeMinutes';
import { minutesApprovalOf } from '$lib/data/minutesApproval';
import { minutesAnswerKeptWords } from '$lib/data/describeMinutesKept';
import { boardMinutesRefusals } from '$lib/data/boardroomMinutesRules';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import type { MinutesAnswerDraft } from '$lib/data/validateMinutesAnswer';
import type { RoomCaller } from '$lib/data/placeBoardContribution';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import type { SeatAnswer } from './steerOwnClaude';

const refused = (answer: string): SeatAnswer => ({ answer, isKept: false });

/**
 * A director's own answer to the latest version of the minutes: approves it, or asks for a change in their words.
 * It is kept for the signed-in director's own seat only, once a version, and belongs to that version alone.
 */
export async function answerBoardroomMinutes(
	supabase: SupabaseClient,
	organisation: Organisation,
	meetingId: string,
	draft: MinutesAnswerDraft,
	caller: RoomCaller
): Promise<SeatAnswer> {
	const record = await getMeetingRecord(supabase, organisation.id, meetingId);
	if (record === null) return refused(boardroomMeetingRefusals.noSuchMeeting);
	const place = placeMinutesAnswer(record, draft, caller);
	if (typeof place === 'string') return refused(place);
	const { version } = place;
	const placing = { meeting: record.meeting, seatId: place.seatId, givenBy: caller.accountId, minutesId: version.id };
	const isKept = await insertMinutesAnswer(supabase, placing, draft);
	if (!isKept) return refused(boardMinutesRefusals.alreadyAnswered);
	const after = (await getMeetingRecord(supabase, organisation.id, meetingId)) ?? record;
	return { answer: minutesAnswerKeptWords(draft.version, minutesApprovalOf(after, caller.now), after.directors), isKept: true };
}
