import type { SupabaseClient } from '@supabase/supabase-js';
import { getMeetingRecord } from './readBoardroomMeeting';
import { insertBoardContribution } from './saveBoardroomRoom';
import { settleBoardroomItem } from './settleBoardroomItem';
import { placeBoardContribution, type ContributionPlace, type RoomCaller } from '$lib/data/placeBoardContribution';
import { itemTalkOf } from '$lib/data/boardroomRoomTurns';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import { boardRoomRefusals } from '$lib/data/boardroomRoomRules';
import { describeContributionKept } from '$lib/data/describeBoardItem';
import type { ContributionDraft } from '$lib/data/validateBoardContribution';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

function placingOf(record: MeetingRecord, place: ContributionPlace, draft: ContributionDraft, caller: RoomCaller) {
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

/**
 * A director's Claude says its piece on an agenda item, for the signed-in director only, in its turn; the item
 * comes out of the room the moment every seat agrees the wording on the table, or the rounds run out.
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
	const cameOutAlready = await settleBoardroomItem(supabase, record, place.item, place.talk);
	if (cameOutAlready !== null) return boardRoomRefusals.itemHasComeOut;
	const keptId = await insertBoardContribution(supabase, placingOf(record, place, draft, caller));
	if (keptId === null) return boardRoomRefusals.alreadySpokenThisRound;
	return answerAfterSpeaking(supabase, record, place, { keptId, itemNumber: draft.itemNumber, now: caller.now });
}
