import type { SupabaseClient } from '@supabase/supabase-js';
import { getAgendaItemsOfMeetings, getMeetingsOfOrganisation } from './getMeetingsOfOrganisation';
import { getDirectorsOfOrganisation } from './getDirectorsOfOrganisation';
import { nameOfSeat, standingAgenda, type AgendaItem, type BoardroomMeeting } from '$lib/data/boardroomMeeting';
import type { BoardroomDirector } from '$lib/data/boardroomDirector';
import type { MeetingSummary } from '$lib/data/describeBoardroomMeeting';

function summarise(meeting: BoardroomMeeting, items: AgendaItem[], directors: BoardroomDirector[]): MeetingSummary {
	const agenda = standingAgenda(items.filter((item) => item.meetingId === meeting.id));
	const chairName = nameOfSeat(directors, meeting.chairDirectorId);
	return { meeting, itemCount: agenda.length, chairName };
}

/** Every meeting of an organisation's board with its chair and the length of its agenda, latest first. */
export async function getMeetingSummaries(supabase: SupabaseClient, organisationId: string): Promise<MeetingSummary[]> {
	const [meetings, directors] = await Promise.all([
		getMeetingsOfOrganisation(supabase, organisationId),
		getDirectorsOfOrganisation(supabase, organisationId)
	]);
	const meetingIds = meetings.map((meeting) => meeting.id);
	const items = await getAgendaItemsOfMeetings(supabase, meetingIds);
	return meetings.map((meeting) => summarise(meeting, items, directors));
}
