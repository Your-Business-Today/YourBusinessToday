import type { SupabaseClient } from '@supabase/supabase-js';
import { getMeetingRecord } from './readBoardroomMeeting';
import { insertBoardContribution, type ContributionPlacing } from './saveBoardroomRoom';
import { settleBoardroomItem } from './settleBoardroomItem';
import { itemTalkOf } from '$lib/data/boardroomRoomTurns';
import { boardRoomRefusals } from '$lib/data/boardroomRoomRules';
import { describeContributionKept } from '$lib/data/describeBoardItem';
import type { ContributionPlace, RoomCaller } from '$lib/data/placeBoardContribution';
import type { ContributionDraft } from '$lib/data/validateBoardContribution';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';

/** A contribution as it is kept: where the room placed it, and what the draft says. */
export function placingOf(record: MeetingRecord, place: ContributionPlace, draft: ContributionDraft, caller: RoomCaller): ContributionPlacing {
	const { item, seatId, round, onProposalId, correctsId } = place;
	const said = { stance: draft.stance, words: draft.words, wording: draft.wording };
	return { meeting: record.meeting, agendaItemId: item.id, seatId, spokenBy: caller.accountId, round, onProposalId, correctsId, ...said };
}

/** What was just said: its id, the item's number now, and the moment. */
type JustSaid = { keptId: string; itemNumber: number; now: Date };

async function answerAfterSpeaking(supabase: SupabaseClient, record: MeetingRecord, place: ContributionPlace, said: JustSaid) {
	const { keptId, itemNumber, now } = said;
	const { meeting } = record;
	const after = (await getMeetingRecord(supabase, meeting.organisationId, meeting.id)) ?? record;
	const talk = itemTalkOf(after, place.item, now);
	const outcome = await settleBoardroomItem(supabase, after, place.item, talk);
	const kept = talk.contributions.find((contribution) => contribution.id === keptId);
	const reading = { record: after, item: place.item, itemNumber, talk, outcome, seatId: place.seatId };
	return kept === undefined ? boardRoomRefusals.itemHasComeOut : describeContributionKept(reading, kept);
}

/** The answer to saying a piece in the room, and the id it was kept under; null when it was not said. */
export type SaidInTheRoom = { answer: string; keptId: string | null };

/**
 * Says a piece the room has placed, in its turn; the item comes out of the room the moment every seat agrees
 * the wording on the table, or the rounds run out. speak_on_board_item and a director's yes both say through here.
 */
export async function sayInTheRoom(
	supabase: SupabaseClient,
	record: MeetingRecord,
	place: ContributionPlace,
	draft: ContributionDraft,
	caller: RoomCaller
): Promise<SaidInTheRoom> {
	const cameOutAlready = await settleBoardroomItem(supabase, record, place.item, place.talk);
	if (cameOutAlready !== null) return { answer: boardRoomRefusals.itemHasComeOut, keptId: null };
	const keptId = await insertBoardContribution(supabase, placingOf(record, place, draft, caller));
	if (keptId === null) return { answer: boardRoomRefusals.alreadySpokenThisRound, keptId: null };
	const answer = await answerAfterSpeaking(supabase, record, place, { keptId, itemNumber: draft.itemNumber, now: caller.now });
	return { answer, keptId };
}
