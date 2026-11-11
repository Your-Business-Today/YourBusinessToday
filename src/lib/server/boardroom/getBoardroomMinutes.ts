import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { rowsOfMeeting } from './rowsOfMeeting';
import {
	boardMinutesTables,
	meetingClosingColumns,
	minutesAnswerColumns,
	minutesVersionColumns,
	parseMeetingClosingRecord,
	parseMinutesAnswerRecord,
	parseMinutesVersionRecord
} from './boardroomMinutesRecord';
import { noMeetingMinutes, type MeetingClosing, type MeetingMinutes } from '$lib/data/boardroomMinutes';

/** How a meeting closed, null while it is open, or undefined before 0192 has run. */
async function getClosingOfMeeting(supabase: SupabaseClient, meetingId: string): Promise<MeetingClosing | null | undefined> {
	const { data, error } = await supabase.from(boardMinutesTables.closings).select(meetingClosingColumns).eq('meeting_id', meetingId).maybeSingle();
	if (isSchemaNotYetMigrated(error)) return undefined;
	if (error) throw error;
	return data === null ? null : parseMeetingClosingRecord(data);
}

/**
 * A meeting's closing, every version of its minutes and every director's answer to them, which every director of
 * the board reads. Nothing at all until migration 0192 has run, and nothing more while the meeting is open.
 */
export async function getMinutesOfMeeting(supabase: SupabaseClient, meetingId: string): Promise<MeetingMinutes> {
	const closing = await getClosingOfMeeting(supabase, meetingId);
	if (closing === undefined || closing === null) return noMeetingMinutes;
	const [versions, answers] = await Promise.all([
		rowsOfMeeting(supabase, boardMinutesTables.versions, minutesVersionColumns, meetingId),
		rowsOfMeeting(supabase, boardMinutesTables.answers, minutesAnswerColumns, meetingId)
	]);
	return { closing, versions: versions.map(parseMinutesVersionRecord), answers: answers.map(parseMinutesAnswerRecord) };
}
