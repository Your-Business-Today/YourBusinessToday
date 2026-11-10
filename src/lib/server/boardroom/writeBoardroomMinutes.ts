import type { SupabaseClient } from '@supabase/supabase-js';
import { getMeetingRecord } from './readBoardroomMeeting';
import { insertMinutesVersion } from './saveBoardroomMinutes';
import { placeMinutesVersion } from '$lib/data/placeMinutes';
import { minutesFactsOf } from '$lib/data/minutesFacts';
import { minutesVersionKeptWords } from '$lib/data/describeMinutesKept';
import { boardMinutesRefusals } from '$lib/data/boardroomMinutesRules';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import type { RoomCaller } from '$lib/data/placeBoardContribution';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import type { SeatAnswer } from './steerOwnClaude';

const refused = (answer: string): SeatAnswer => ({ answer, isKept: false });

/**
 * The minute-taker's Claude keeps its words as the next numbered version of a closed meeting's minutes. The service
 * puts the facts in from the record as they stand now, so each version keeps every decision's result as it stood.
 */
export async function writeBoardroomMinutes(
	supabase: SupabaseClient,
	organisation: Organisation,
	meetingId: string,
	words: string,
	caller: RoomCaller
): Promise<SeatAnswer> {
	const record = await getMeetingRecord(supabase, organisation.id, meetingId);
	if (record === null) return refused(boardroomMeetingRefusals.noSuchMeeting);
	const place = placeMinutesVersion(record, caller);
	if (typeof place === 'string') return refused(place);
	const facts = minutesFactsOf(organisation.name, record, caller.now);
	const placing = { meeting: record.meeting, seatId: place.seatId, givenBy: caller.accountId };
	const isKept = await insertMinutesVersion(supabase, placing, { version: place.version, words, facts });
	if (!isKept) return refused(boardMinutesRefusals.notTheLatestVersion);
	return { answer: minutesVersionKeptWords(place.version), isKept: true };
}
