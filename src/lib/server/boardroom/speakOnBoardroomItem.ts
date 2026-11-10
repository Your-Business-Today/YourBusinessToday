import type { SupabaseClient } from '@supabase/supabase-js';
import { getMeetingRecord } from './readBoardroomMeeting';
import { getControlsOfSeat } from './getBoardroomSeatControls';
import { insertHeldContribution } from './saveBoardroomSeatControls';
import { isEarlierDecisionOfBoard } from './getBoardroomDecisions';
import { placingOf, sayInTheRoom } from './sayInTheRoom';
import { placeBoardContribution, type ContributionPlace, type RoomCaller } from '$lib/data/placeBoardContribution';
import { heldAwaitingOnItem, isAskingFirst, isPaused, type SeatControls } from '$lib/data/boardroomSeatControls';
import { seatControlRefusals } from '$lib/data/boardroomSeatControlRules';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import { boardDecisionRefusals } from '$lib/data/boardroomDecisionRules';
import { heldForDirectorWords } from '$lib/data/describeSeatControls';
import type { ContributionDraft } from '$lib/data/validateBoardContribution';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** What a Claude that must ask its director first is about to say, and everything the room placed it with. */
type HeldPiece = { record: MeetingRecord; place: ContributionPlace; draft: ContributionDraft; caller: RoomCaller };

async function holdForDirector(supabase: SupabaseClient, controls: SeatControls, piece: HeldPiece): Promise<string> {
	const { record, place, draft, caller } = piece;
	const { item } = place;
	const isAlreadyHolding = heldAwaitingOnItem(controls, item.id) !== null;
	if (isAlreadyHolding) return seatControlRefusals.alreadyHolding;
	await insertHeldContribution(supabase, placingOf(record, place, draft, caller));
	return heldForDirectorWords(draft.itemNumber);
}

/** Why a proposal cannot replace the decision it names, or null when it names none or one the board took earlier. */
async function refusalOfReplaces(supabase: SupabaseClient, record: MeetingRecord, draft: ContributionDraft): Promise<string | null> {
	const { replacesDecisionId } = draft;
	if (replacesDecisionId === null) return null;
	const { meeting } = record;
	const replaced = { organisationId: meeting.organisationId, meetingId: meeting.id, decisionId: replacesDecisionId };
	const isEarlier = await isEarlierDecisionOfBoard(supabase, replaced);
	return isEarlier ? null : boardDecisionRefusals.noSuchEarlierDecision;
}

/**
 * A director's Claude says its piece on an agenda item, for the signed-in director only, in its turn. A Claude
 * its director has paused says nothing; one whose director asked to be asked first holds the piece for their yes.
 */
export async function speakOnBoardroomItem(
	supabase: SupabaseClient,
	organisation: Organisation,
	meetingId: string,
	draft: ContributionDraft,
	caller: RoomCaller
): Promise<string> {
	const record = await getMeetingRecord(supabase, organisation.id, meetingId);
	if (record === null) return boardroomMeetingRefusals.noSuchMeeting;
	const place = placeBoardContribution(record, draft, caller);
	if (typeof place === 'string') return place;
	const replacesRefusal = await refusalOfReplaces(supabase, record, draft);
	if (replacesRefusal !== null) return replacesRefusal;
	const controls = await getControlsOfSeat(supabase, meetingId, place.seatId);
	if (isPaused(controls)) return seatControlRefusals.claudeIsPaused;
	if (isAskingFirst(controls)) return holdForDirector(supabase, controls, { record, place, draft, caller });
	const said = await sayInTheRoom(supabase, record, place, draft, caller);
	return said.answer;
}
