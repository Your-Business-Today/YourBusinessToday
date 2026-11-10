import type { SupabaseClient } from '@supabase/supabase-js';
import { getMeetingRecord } from './readBoardroomMeeting';
import { insertBoardroomBrief, type BriefPlacing } from './saveBoardroomBrief';
import { meetingStage, meetingStages, standingAgenda } from '$lib/data/boardroomMeeting';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import { boardBriefRefusals } from '$lib/data/boardroomBriefRules';
import { briefKept } from '$lib/data/describeBoardroomBrief';
import { sittingSeatOf } from '$lib/data/boardroomDirector';
import type { BoardBriefDraft } from '$lib/data/boardroomBrief';
import type { MeetingCaller } from './callBoardroomMeeting';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** A brief's place on the meeting, and the title of the item it is on, so the answer can name it. */
type BriefPlace = { placing: BriefPlacing; itemTitle: string };

/** Where a director's brief goes, by the item's number now and the caller's own seat; or why it cannot go there. */
export function placeBrief(record: MeetingRecord, itemNumber: number, caller: MeetingCaller): BriefPlace | string {
	if (meetingStage(record.meeting, caller.now) === meetingStages.closed) return boardBriefRefusals.meetingHasClosed;
	const item = standingAgenda(record.items)[itemNumber - 1];
	if (item === undefined) return boardBriefRefusals.itemNotOnAgenda;
	const seat = sittingSeatOf(record.directors, caller.accountId);
	if (seat === null) return boardBriefRefusals.callerHasNoSeat;
	const placing = { meeting: record.meeting, agendaItemId: item.id, seatId: seat.id, writtenBy: caller.accountId };
	return { placing, itemTitle: item.title };
}

/**
 * Keep a new version of the caller's own brief on an agenda item, by the number read_board_meeting gives
 * it now, and read it back. The site's form and the connector both brief through here.
 */
export async function briefBoardroomItem(
	supabase: SupabaseClient,
	organisation: Organisation,
	meetingId: string,
	draft: BoardBriefDraft,
	caller: MeetingCaller
): Promise<{ answer: string; isKept: boolean }> {
	const record = await getMeetingRecord(supabase, organisation.id, meetingId);
	if (record === null) return { answer: boardroomMeetingRefusals.noSuchMeeting, isKept: false };
	const place = placeBrief(record, draft.itemNumber, caller);
	if (typeof place === 'string') return { answer: place, isKept: false };
	const saved = await insertBoardroomBrief(supabase, place.placing, draft);
	return { answer: briefKept(draft.itemNumber, place.itemTitle, saved.version, draft), isKept: true };
}
