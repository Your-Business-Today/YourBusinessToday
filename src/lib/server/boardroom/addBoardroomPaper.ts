import type { SupabaseClient } from '@supabase/supabase-js';
import { getMeetingRecord } from './readBoardroomMeeting';
import { grantPaperUpload, insertNotePaper, type PaperPlacing } from './saveBoardroomPaper';
import { meetingStage, meetingStages, standingAgenda } from '$lib/data/boardroomMeeting';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import { boardPaperRefusals } from '$lib/data/boardroomPaperRules';
import { notePaperAdded, paperUploadGranted } from '$lib/data/describeBoardroomPaper';
import { sittingSeatOf } from '$lib/data/boardroomDirector';
import { boardPaperKinds, type BoardPaperDraft } from '$lib/data/boardroomPaper';
import type { MeetingCaller } from './callBoardroomMeeting';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

type PaperOnItem = { itemNumber: number; title: string };

/** Where a paper goes on the meeting, by the item's number now, and the seat adding it; or why it cannot go there. */
export function placePaper(record: MeetingRecord, draft: PaperOnItem, caller: MeetingCaller): PaperPlacing | string {
	if (meetingStage(record.meeting, caller.now) === meetingStages.closed) return boardPaperRefusals.meetingHasClosed;
	const item = standingAgenda(record.items)[draft.itemNumber - 1];
	if (item === undefined) return boardPaperRefusals.itemNotOnAgenda;
	const seat = sittingSeatOf(record.directors, caller.accountId);
	if (seat === null) return boardPaperRefusals.callerHasNoSeat;
	return { meeting: record.meeting, agendaItemId: item.id, seatId: seat.id, addedBy: caller.accountId, title: draft.title };
}

/**
 * Put a paper on an agenda item by the number read_board_meeting gives it now: a written note is kept
 * at once, and a file is given a signed link to be sent to, kept once record_board_paper_upload finds it.
 */
export async function addBoardroomPaper(
	supabase: SupabaseClient,
	organisation: Organisation,
	meetingId: string,
	draft: BoardPaperDraft,
	caller: MeetingCaller
): Promise<string> {
	const record = await getMeetingRecord(supabase, organisation.id, meetingId);
	if (record === null) return boardroomMeetingRefusals.noSuchMeeting;
	const placing = placePaper(record, draft, caller);
	if (typeof placing === 'string') return placing;
	const content = draft.content;
	if (content.kind === boardPaperKinds.note) {
		const paperId = await insertNotePaper(supabase, placing, content.note, caller.now);
		return notePaperAdded(draft.title, paperId, draft.itemNumber);
	}
	const granted = await grantPaperUpload(supabase, placing, content, caller.now);
	return paperUploadGranted(content, granted, draft.itemNumber);
}
