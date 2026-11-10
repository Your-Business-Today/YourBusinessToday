import type { SupabaseClient } from '@supabase/supabase-js';
import { boardroomMeetingColumns, parseBoardroomMeetingRecord } from './boardroomMeetingRecord';
import type { BoardroomMeeting } from '$lib/data/boardroomMeeting';
import type { AgendaItemDraft } from '$lib/data/validateAgendaItem';

export type MeetingCalling = {
	organisationId: string;
	meetsAt: string;
	chairDirectorId: string;
	calledByDirectorId: string;
	calledBy: string;
};

/** Where new items go on an agenda: the place after the last, whether they are any other business, and who adds them. */
export type AgendaPlacing = {
	meetingId: string;
	firstPosition: number;
	isAnyOtherBusiness: boolean;
	addedBy: string;
};

export async function insertBoardroomMeeting(
	supabase: SupabaseClient,
	calling: MeetingCalling
): Promise<BoardroomMeeting> {
	const { data, error } = await supabase
		.from('boardroom_meetings')
		.insert({
			organisation_id: calling.organisationId,
			meets_at: calling.meetsAt,
			chair_director_id: calling.chairDirectorId,
			called_by_director_id: calling.calledByDirectorId,
			called_by: calling.calledBy
		})
		.select(boardroomMeetingColumns)
		.single();
	if (error) throw error;
	return parseBoardroomMeetingRecord(data);
}

export async function insertAgendaItems(
	supabase: SupabaseClient,
	placing: AgendaPlacing,
	drafts: AgendaItemDraft[]
): Promise<void> {
	if (drafts.length === 0) return;
	const rows = drafts.map((draft, index) => ({
		meeting_id: placing.meetingId,
		position: placing.firstPosition + index,
		title: draft.title,
		purpose: draft.purpose,
		is_any_other_business: placing.isAnyOtherBusiness,
		added_by: placing.addedBy
	}));
	const { error } = await supabase.from('boardroom_agenda_items').insert(rows);
	if (error) throw error;
}
