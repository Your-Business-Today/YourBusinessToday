import type { SupabaseClient } from '@supabase/supabase-js';
import {
	agendaItemColumns,
	boardroomMeetingColumns,
	parseAgendaItemRecord,
	parseBoardroomMeetingRecord
} from './boardroomMeetingRecord';
import type { AgendaItem, BoardroomMeeting } from '$lib/data/boardroomMeeting';

/** Every meeting of an organisation's board, latest first. */
export async function getMeetingsOfOrganisation(
	supabase: SupabaseClient,
	organisationId: string
): Promise<BoardroomMeeting[]> {
	const { data, error } = await supabase
		.from('boardroom_meetings')
		.select(boardroomMeetingColumns)
		.eq('organisation_id', organisationId)
		.order('meets_at', { ascending: false });
	if (error) throw error;
	return data.map(parseBoardroomMeetingRecord);
}

/** One meeting of an organisation's board, or null when the organisation has none with that id. */
export async function getBoardroomMeeting(
	supabase: SupabaseClient,
	organisationId: string,
	meetingId: string
): Promise<BoardroomMeeting | null> {
	const { data, error } = await supabase
		.from('boardroom_meetings')
		.select(boardroomMeetingColumns)
		.eq('organisation_id', organisationId)
		.eq('id', meetingId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseBoardroomMeetingRecord(data);
}

/** Every item ever put on these meetings' agendas, withdrawn ones included, in their order. */
export async function getAgendaItemsOfMeetings(supabase: SupabaseClient, meetingIds: string[]): Promise<AgendaItem[]> {
	if (meetingIds.length === 0) return [];
	const { data, error } = await supabase
		.from('boardroom_agenda_items')
		.select(agendaItemColumns)
		.in('meeting_id', meetingIds)
		.order('position', { ascending: true });
	if (error) throw error;
	return data.map(parseAgendaItemRecord);
}
