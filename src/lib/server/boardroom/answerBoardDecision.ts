import type { SupabaseClient } from '@supabase/supabase-js';
import { getMeetingRecord } from './readBoardroomMeeting';
import { raiseCarriedActions } from './raiseCarriedActions';
import { insertBoardDecision, insertDecisionAnswer } from './saveBoardroomDecisions';
import { placeDecisionAnswer, type DecisionAnswerPlace } from '$lib/data/placeDecisionAnswer';
import { decisionOnItem } from '$lib/data/boardDecisionOnItem';
import { decisionAnswerKeptWords } from '$lib/data/describeBoardDecision';
import { boardDecisionRefusals } from '$lib/data/boardroomDecisionRules';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import type { DecisionAnswerDraft } from '$lib/data/validateDecisionAnswer';
import type { RoomCaller } from '$lib/data/placeBoardContribution';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import type { SeatAnswer } from './steerOwnClaude';

const refused = (answer: string): SeatAnswer => ({ answer, isKept: false });

/** The decision's id: as kept, or put now with the rule in force, when this is the first answer to it. */
async function decisionIdOf(supabase: SupabaseClient, record: MeetingRecord, place: DecisionAnswerPlace, caller: RoomCaller): Promise<string> {
	const { decision } = place.onItem;
	if (decision.id !== null) return decision.id;
	return insertBoardDecision(supabase, record.meeting, decision, caller.accountId);
}

/** Where the decision stands after the answer, with any actions raised now that it has carried. */
async function answerAfterKeeping(supabase: SupabaseClient, organisation: Organisation, record: MeetingRecord, place: DecisionAnswerPlace, caller: RoomCaller): Promise<string> {
	const { record: after, words } = await raiseCarriedActions(supabase, organisation, record, caller);
	return decisionAnswerKeptWords(place.itemNumber, decisionOnItem(after, place.item, caller.now), after.directors) + words;
}

/**
 * A director's own answer to the decision on an item: agrees, disagrees or abstains, with their reason if they
 * give one. It is kept for the signed-in director's own seat only, once, while the meeting is open. Pausing their
 * Claude does not stop the director answering. The first answer puts the decision with the rule in force, and the
 * answer that carries it raises its actions.
 */
export async function answerBoardDecision(
	supabase: SupabaseClient,
	organisation: Organisation,
	meetingId: string,
	draft: DecisionAnswerDraft,
	caller: RoomCaller
): Promise<SeatAnswer> {
	const record = await getMeetingRecord(supabase, organisation.id, meetingId);
	if (record === null) return refused(boardroomMeetingRefusals.noSuchMeeting);
	const place = placeDecisionAnswer(record, draft, caller);
	if (typeof place === 'string') return refused(place);
	const decisionId = await decisionIdOf(supabase, record, place, caller);
	const placing = { meeting: record.meeting, decisionId, seatId: place.seatId, answeredBy: caller.accountId };
	const isKept = await insertDecisionAnswer(supabase, placing, draft);
	if (!isKept) return refused(boardDecisionRefusals.alreadyAnswered);
	return { answer: await answerAfterKeeping(supabase, organisation, record, place, caller), isKept: true };
}
