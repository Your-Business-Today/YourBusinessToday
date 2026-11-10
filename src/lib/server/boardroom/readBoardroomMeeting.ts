import type { SupabaseClient } from '@supabase/supabase-js';
import { getAgendaItemsOfMeetings, getBoardroomMeeting } from './getMeetingsOfOrganisation';
import { getMeetingSummaries } from './getMeetingSummaries';
import { getDirectorsOfOrganisation } from './getDirectorsOfOrganisation';
import { getKeptPapersOfMeeting } from './getBoardroomPapers';
import { getRecordPapersOfMeeting } from './getBoardroomRecordPapers';
import { isUuid } from '$lib/data/isUuid';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import {
	describeBoardroomMeeting,
	describeBoardroomMeetings,
	type MeetingRecord
} from '$lib/data/describeBoardroomMeeting';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** One meeting of an organisation's board with its board, agenda and papers, or null when it has none with that id. */
export async function getMeetingRecord(
	supabase: SupabaseClient,
	organisationId: string,
	meetingId: string
): Promise<MeetingRecord | null> {
	if (!isUuid(meetingId)) return null;
	const meeting = await getBoardroomMeeting(supabase, organisationId, meetingId);
	if (meeting === null) return null;
	const [directors, items, papers, recordPapers] = await Promise.all([
		getDirectorsOfOrganisation(supabase, organisationId),
		getAgendaItemsOfMeetings(supabase, [meeting.id]),
		getKeptPapersOfMeeting(supabase, meeting.id),
		getRecordPapersOfMeeting(supabase, meeting.id)
	]);
	return { meeting, directors, items, papers, recordPapers };
}

export async function readBoardroomMeeting(
	supabase: SupabaseClient,
	organisation: Organisation,
	meetingId: string,
	now: Date
): Promise<string> {
	const record = await getMeetingRecord(supabase, organisation.id, meetingId);
	if (record === null) return boardroomMeetingRefusals.noSuchMeeting;
	return describeBoardroomMeeting(organisation.name, record, now);
}

/** Every meeting of an organisation's board, called, open and closed, latest first. */
export async function listBoardroomMeetings(
	supabase: SupabaseClient,
	organisation: Organisation,
	now: Date
): Promise<string> {
	const summaries = await getMeetingSummaries(supabase, organisation.id);
	return describeBoardroomMeetings(organisation.name, summaries, now);
}
