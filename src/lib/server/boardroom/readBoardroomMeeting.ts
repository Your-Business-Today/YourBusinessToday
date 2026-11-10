import type { SupabaseClient } from '@supabase/supabase-js';
import { getAgendaItemsOfMeetings, getBoardroomMeeting, getMeetingsOfOrganisation } from './getMeetingsOfOrganisation';
import { getDirectorsOfOrganisation } from './getDirectorsOfOrganisation';
import { getKeptPapersOfMeeting } from './getBoardroomPapers';
import { getRecordPapersOfMeeting } from './getBoardroomRecordPapers';
import { isUuid } from '$lib/data/isUuid';
import { nameOfSeat, standingAgenda, type AgendaItem, type BoardroomMeeting } from '$lib/data/boardroomMeeting';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import {
	describeBoardroomMeeting,
	describeBoardroomMeetings,
	type MeetingRecord
} from '$lib/data/describeBoardroomMeeting';
import type { BoardroomDirector } from '$lib/data/boardroomDirector';
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

function summarise(meeting: BoardroomMeeting, items: AgendaItem[], directors: BoardroomDirector[]) {
	const agenda = standingAgenda(items.filter((item) => item.meetingId === meeting.id));
	const chairName = nameOfSeat(directors, meeting.chairDirectorId);
	return { meeting, itemCount: agenda.length, chairName };
}

/** Every meeting of an organisation's board, called, open and closed, latest first. */
export async function listBoardroomMeetings(
	supabase: SupabaseClient,
	organisation: Organisation,
	now: Date
): Promise<string> {
	const [meetings, directors] = await Promise.all([
		getMeetingsOfOrganisation(supabase, organisation.id),
		getDirectorsOfOrganisation(supabase, organisation.id)
	]);
	const items = await getAgendaItemsOfMeetings(
		supabase,
		meetings.map((meeting) => meeting.id)
	);
	const summaries = meetings.map((meeting) => summarise(meeting, items, directors));
	return describeBoardroomMeetings(organisation.name, summaries, now);
}
