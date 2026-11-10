import type { SupabaseClient } from '@supabase/supabase-js';
import { getMeetingRecord } from './readBoardroomMeeting';
import { getControlsOfSeat } from './getBoardroomSeatControls';
import { insertBoardAction } from './saveBoardroomActions';
import { boardActionWhere } from './boardActionWhere';
import { placeBoardAction } from '$lib/data/placeBoardAction';
import { actionKeptWords } from '$lib/data/describeBoardActions';
import { boardActionRefusals } from '$lib/data/boardroomActionRules';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import { isAskingFirst, isPaused } from '$lib/data/boardroomSeatControls';
import type { BoardActionDraft } from '$lib/data/validateBoardAction';
import type { RoomCaller } from '$lib/data/placeBoardContribution';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import type { SeatAnswer } from './steerOwnClaude';

/** Who records an action: the director, and whether it comes through their own Claude rather than the meeting page. */
export type ActionRecorder = RoomCaller & { isThroughClaude: boolean };

const refused = (answer: string): SeatAnswer => ({ answer, isKept: false });

async function isClaudeHeldBack(supabase: SupabaseClient, meetingId: string, seatId: string): Promise<boolean> {
	const controls = await getControlsOfSeat(supabase, meetingId, seatId);
	return isPaused(controls) || isAskingFirst(controls);
}

/**
 * A director records an action the meeting agrees on an item for decision, before its first answer, so the
 * directors confirm it with the decision. Its own Claude records none while it is paused or asks first; the
 * director still records it on the page. Where it goes is checked now, so nothing stops it being raised later.
 */
export async function recordBoardAction(
	supabase: SupabaseClient,
	organisation: Organisation,
	meetingId: string,
	draft: BoardActionDraft,
	recorder: ActionRecorder
): Promise<SeatAnswer> {
	const record = await getMeetingRecord(supabase, organisation.id, meetingId);
	if (record === null) return refused(boardroomMeetingRefusals.noSuchMeeting);
	const place = placeBoardAction(record, draft.itemNumber, recorder);
	if (typeof place === 'string') return refused(place);
	if (recorder.isThroughClaude && (await isClaudeHeldBack(supabase, meetingId, place.seatId))) return refused(boardActionRefusals.claudeHoldsBack);
	const where = await boardActionWhere(supabase, organisation.id, draft);
	if (typeof where === 'string') return refused(where);
	const { item, seatId } = place;
	const { owner } = where;
	const placing = { meeting: record.meeting, agendaItemId: item.id, what: draft.what, dueOn: draft.dueOn, ...where };
	await insertBoardAction(supabase, { ...placing, seatId, recordedBy: recorder.accountId });
	return { answer: actionKeptWords(draft.itemNumber, { ...placing, ownerName: owner.name }), isKept: true };
}
