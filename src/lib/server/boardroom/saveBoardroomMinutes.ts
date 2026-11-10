import type { SupabaseClient } from '@supabase/supabase-js';
import { boardMinutesTables } from './boardroomMinutesRecord';
import { isUniqueViolation } from './saveBoardroomRoom';
import type { BoardroomMeeting } from '$lib/data/boardroomMeeting';
import type { MinutesFacts } from '$lib/data/boardroomMinutes';
import type { MinutesAnswerDraft } from '$lib/data/validateMinutesAnswer';

/** Who writes a row of the minutes: the meeting, the director's seat, and the account. */
export type MinutesPlacing = { meeting: BoardroomMeeting; seatId: string; givenBy: string };

/** Closes the meeting once, as its minute-taker; false when it was closed already. The database sets its closed_at. */
export async function insertMeetingClosing(supabase: SupabaseClient, placing: MinutesPlacing): Promise<boolean> {
	const { meeting } = placing;
	const row = { meeting_id: meeting.id, organisation_id: meeting.organisationId, closed_by_director_id: placing.seatId, closed_by: placing.givenBy };
	const { error } = await supabase.from(boardMinutesTables.closings).insert(row);
	if (isUniqueViolation(error)) return false;
	if (error) throw error;
	return true;
}

/** A version of the minutes as it is kept: its number, the Claude's words and the facts the service put in. */
export type MinutesVersionDraft = { version: number; words: string; facts: MinutesFacts };

/** Keeps a version of the minutes; false when another version took that number first. */
export async function insertMinutesVersion(supabase: SupabaseClient, placing: MinutesPlacing, draft: MinutesVersionDraft): Promise<boolean> {
	const { meeting } = placing;
	const row = {
		organisation_id: meeting.organisationId,
		meeting_id: meeting.id,
		version: draft.version,
		words: draft.words,
		facts: draft.facts,
		written_by_director_id: placing.seatId,
		written_by: placing.givenBy
	};
	const { error } = await supabase.from(boardMinutesTables.versions).insert(row);
	if (isUniqueViolation(error)) return false;
	if (error) throw error;
	return true;
}

/** Keeps a director's answer to one version as they gave it; false when their seat has answered it already. */
export async function insertMinutesAnswer(
	supabase: SupabaseClient,
	placing: MinutesPlacing & { minutesId: string },
	draft: MinutesAnswerDraft
): Promise<boolean> {
	const { meeting } = placing;
	const row = {
		minutes_id: placing.minutesId,
		director_id: placing.seatId,
		organisation_id: meeting.organisationId,
		meeting_id: meeting.id,
		answer: draft.answer,
		change_words: draft.changeWords,
		given_by: placing.givenBy
	};
	const { error } = await supabase.from(boardMinutesTables.answers).insert(row);
	if (isUniqueViolation(error)) return false;
	if (error) throw error;
	return true;
}
