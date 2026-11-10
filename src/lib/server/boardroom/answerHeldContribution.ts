import type { SupabaseClient } from '@supabase/supabase-js';
import { findOwnSeatOnMeeting, type OwnSeat } from './ownSeatOnMeeting';
import { getControlsOfSeat } from './getBoardroomSeatControls';
import { insertHeldAnswer } from './saveBoardroomSeatControls';
import { sayInTheRoom } from './sayInTheRoom';
import { placeBoardContribution, type RoomCaller } from '$lib/data/placeBoardContribution';
import { heldAnswers, heldAwaitingAnswer, isPaused, type HeldContribution } from '$lib/data/boardroomSeatControls';
import { seatControlRefusals } from '$lib/data/boardroomSeatControlRules';
import { draftOfHeld } from '$lib/data/heldContributionDraft';
import { heldKeptUnsaidWords } from '$lib/data/describeSeatControls';
import type { HeldAnswerDraft } from '$lib/data/validateSeatControl';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import type { SeatAnswer } from './steerOwnClaude';

const refused = (answer: string): SeatAnswer => ({ answer, isKept: false });

/** On the director's yes, the held piece is said through the same placing and saying as speak_on_board_item. */
async function sayHeld(supabase: SupabaseClient, ownSeat: OwnSeat, held: HeldContribution, caller: RoomCaller): Promise<SeatAnswer> {
	const draft = draftOfHeld(ownSeat.record, held, caller.now);
	if (typeof draft === 'string') return refused(draft);
	const place = placeBoardContribution(ownSeat.record, draft, caller);
	if (typeof place === 'string') return refused(place);
	const said = await sayInTheRoom(supabase, ownSeat.record, place, draft, caller);
	if (said.keptId === null) return refused(said.answer);
	await insertHeldAnswer(supabase, ownSeat.placing, { heldId: held.id, answer: heldAnswers.said, contributionId: said.keptId });
	return { answer: said.answer, isKept: true };
}

/**
 * A director answers a piece their own Claude holds for them: yes says it in the room, in its turn; no keeps it
 * unsaid, as what was proposed. Only the director's own held pieces are found, so nobody answers for another.
 */
export async function answerHeldContribution(
	supabase: SupabaseClient,
	organisation: Organisation,
	meetingId: string,
	draft: HeldAnswerDraft,
	caller: RoomCaller
): Promise<SeatAnswer> {
	const ownSeat = await findOwnSeatOnMeeting(supabase, organisation.id, meetingId, caller);
	if (typeof ownSeat === 'string') return refused(ownSeat);
	const { placing } = ownSeat;
	const controls = await getControlsOfSeat(supabase, meetingId, placing.seatId);
	const held = heldAwaitingAnswer(controls).find((piece) => piece.id === draft.heldId);
	if (held === undefined) return refused(seatControlRefusals.noSuchHeldPiece);
	if (draft.isYes && isPaused(controls)) return refused(seatControlRefusals.claudeIsPaused);
	if (draft.isYes) return sayHeld(supabase, ownSeat, held, caller);
	await insertHeldAnswer(supabase, placing, { heldId: held.id, answer: heldAnswers.keptUnsaid, contributionId: null });
	return { answer: heldKeptUnsaidWords, isKept: true };
}
