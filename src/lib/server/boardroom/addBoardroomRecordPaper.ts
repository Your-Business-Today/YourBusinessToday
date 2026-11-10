import type { SupabaseClient } from '@supabase/supabase-js';
import { getMeetingRecord } from './readBoardroomMeeting';
import { placePaper } from './addBoardroomPaper';
import { insertRecordPaper } from './saveBoardroomRecordPaper';
import { recordPaperColumns } from './boardroomRecordPaperRecord';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import { boardRecordPaperLimits, boardRecordPaperRefusals } from '$lib/data/boardroomRecordPaperRules';
import { recordPaperAdded } from '$lib/data/describeBoardroomRecordPaper';
import type { BoardRecordPaperDraft, BoardroomRecordPaper, TakenReading } from '$lib/data/boardroomRecordPaper';
import type { MeetingCaller } from './callBoardroomMeeting';
import type { PaperPlacing } from './saveBoardroomPaper';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** Takes the reading asked for from the organisation's records, through the rule of the module it belongs to. */
export type ReadingTaker = () => Promise<TakenReading>;

function keptPaper(placing: PaperPlacing, draft: BoardRecordPaperDraft, reading: string, now: Date): BoardroomRecordPaper {
	const { meeting } = placing;
	return {
		...draft.asked,
		id: crypto.randomUUID(),
		organisationId: meeting.organisationId,
		meetingId: meeting.id,
		agendaItemId: placing.agendaItemId,
		title: placing.title,
		reading,
		takenAt: now.toISOString(),
		addedByDirectorId: placing.seatId,
		addedBy: placing.addedBy
	};
}

/**
 * Put a paper taken from the organisation's own records on an agenda item, by the number read_board_meeting
 * gives it now. The reading is kept word for word as it stood, so the minutes match what the board saw.
 */
export async function addBoardroomRecordPaper(
	supabase: SupabaseClient,
	organisation: Organisation,
	meetingId: string,
	draft: BoardRecordPaperDraft,
	reader: { caller: MeetingCaller; takeReading: ReadingTaker }
): Promise<string> {
	const record = await getMeetingRecord(supabase, organisation.id, meetingId);
	if (record === null) return boardroomMeetingRefusals.noSuchMeeting;
	const { caller, takeReading } = reader;
	const placing = placePaper(record, draft, caller);
	if (typeof placing === 'string') return placing;
	const taken = await takeReading();
	if (typeof taken === 'string') return taken;
	const { reading } = taken;
	if (reading.length > boardRecordPaperLimits.longestReading) return boardRecordPaperRefusals.readingTooLong;
	const paper = keptPaper(placing, draft, reading, caller.now);
	await insertRecordPaper(supabase, recordPaperColumns(paper));
	return recordPaperAdded(paper, draft.itemNumber);
}
