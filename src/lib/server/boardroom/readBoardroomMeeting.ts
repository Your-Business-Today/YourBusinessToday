import type { SupabaseClient } from '@supabase/supabase-js';
import { getAgendaItemsOfMeetings, getBoardroomMeeting } from './getMeetingsOfOrganisation';
import { getMeetingSummaries } from './getMeetingSummaries';
import { getDirectorsOfOrganisation } from './getDirectorsOfOrganisation';
import { getKeptPapersOfMeeting } from './getBoardroomPapers';
import { getRecordPapersOfMeeting } from './getBoardroomRecordPapers';
import { getMeetingBriefing } from './getBoardroomBriefs';
import { getRoomOfMeeting } from './getBoardroomRoom';
import { getControlsOfReader } from './getBoardroomSeatControls';
import { isUuid } from '$lib/data/isUuid';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import {
	describeBoardroomMeeting,
	describeBoardroomMeetings,
	type MeetingRecord
} from '$lib/data/describeBoardroomMeeting';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import type { MeetingCaller } from './callBoardroomMeeting';

/** One meeting of an organisation's board with its board, agenda, papers and room, or null when it has none with that id. */
export async function getMeetingRecord(
	supabase: SupabaseClient,
	organisationId: string,
	meetingId: string
): Promise<MeetingRecord | null> {
	if (!isUuid(meetingId)) return null;
	const meeting = await getBoardroomMeeting(supabase, organisationId, meetingId);
	if (meeting === null) return null;
	const [directors, items, papers, recordPapers, room] = await Promise.all([
		getDirectorsOfOrganisation(supabase, organisationId),
		getAgendaItemsOfMeetings(supabase, [meeting.id]),
		getKeptPapersOfMeeting(supabase, meeting.id),
		getRecordPapersOfMeeting(supabase, meeting.id),
		getRoomOfMeeting(supabase, meeting.id)
	]);
	return { meeting, directors, items, papers, recordPapers, room };
}

/** One meeting as its reader sees it: the record, with their own briefs, only whose others are in, and their own Claude's controls. */
export async function getBriefedMeetingRecord(
	supabase: SupabaseClient,
	organisationId: string,
	meetingId: string,
	accountId: string
): Promise<MeetingRecord | null> {
	const record = await getMeetingRecord(supabase, organisationId, meetingId);
	if (record === null) return null;
	const [briefing, controls] = await Promise.all([
		getMeetingBriefing(supabase, record, accountId),
		getControlsOfReader(supabase, record, accountId)
	]);
	return { ...record, briefing, controls };
}

export async function readBoardroomMeeting(
	supabase: SupabaseClient,
	organisation: Organisation,
	meetingId: string,
	reader: MeetingCaller
): Promise<string> {
	const record = await getBriefedMeetingRecord(supabase, organisation.id, meetingId, reader.accountId);
	if (record === null) return boardroomMeetingRefusals.noSuchMeeting;
	return describeBoardroomMeeting(organisation.name, record, reader.now);
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
