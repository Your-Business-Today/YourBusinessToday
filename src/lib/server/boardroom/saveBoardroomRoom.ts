import type { SupabaseClient } from '@supabase/supabase-js';
import { boardroomRoomTables } from './boardroomRoomRecord';
import type { BoardroomMeeting } from '$lib/data/boardroomMeeting';
import type { ContributionStance, OutcomeDraft } from '$lib/data/boardroomRoom';

const uniqueViolation = '23505';

export function isUniqueViolation(error: { code?: string } | null): boolean {
	return error?.code === uniqueViolation;
}

/** Who opens a meeting's room and how many rounds it gives each item. */
export type RoomOpening = { meeting: BoardroomMeeting; seatId: string; openedBy: string; roundsLimit: number };

/** Opens a meeting's room; the database sets the meeting's opened_at with it. False when it was already open. */
export async function insertBoardroomRoom(supabase: SupabaseClient, opening: RoomOpening): Promise<boolean> {
	const { meeting } = opening;
	const row = {
		meeting_id: meeting.id,
		organisation_id: meeting.organisationId,
		rounds_limit: opening.roundsLimit,
		opened_by_director_id: opening.seatId,
		opened_by: opening.openedBy
	};
	const { error } = await supabase.from(boardroomRoomTables.rooms).insert(row);
	if (isUniqueViolation(error)) return false;
	if (error) throw error;
	return true;
}

/** One contribution as it is kept: where it goes, who speaks, and what is said. */
export type ContributionPlacing = {
	meeting: BoardroomMeeting;
	agendaItemId: string;
	seatId: string;
	spokenBy: string;
	round: number;
	stance: ContributionStance;
	words: string;
	wording: string | null;
	onProposalId: string | null;
	correctsId: string | null;
	replacesDecisionId: string | null;
};

/** Keeps a contribution as said and gives its id; null when the seat has already taken this round's turn. */
export async function insertBoardContribution(supabase: SupabaseClient, placing: ContributionPlacing): Promise<string | null> {
	const { meeting } = placing;
	const row = {
		organisation_id: meeting.organisationId,
		meeting_id: meeting.id,
		agenda_item_id: placing.agendaItemId,
		director_id: placing.seatId,
		spoken_by: placing.spokenBy,
		round: placing.round,
		stance: placing.stance,
		words: placing.words,
		wording: placing.wording,
		on_proposal_id: placing.onProposalId,
		corrects_id: placing.correctsId,
		replaces_decision_id: placing.replacesDecisionId
	};
	const { data, error } = await supabase.from(boardroomRoomTables.contributions).insert(row).select('id').single();
	if (isUniqueViolation(error)) return null;
	if (error) throw error;
	return data.id as string;
}

/** Keeps how an item came out, once; a second reaching of the same outcome is left as the first was kept. */
export async function insertItemOutcome(
	supabase: SupabaseClient,
	meeting: BoardroomMeeting,
	agendaItemId: string,
	draft: OutcomeDraft
): Promise<void> {
	const row = {
		agenda_item_id: agendaItemId,
		organisation_id: meeting.organisationId,
		meeting_id: meeting.id,
		outcome: draft.outcome,
		proposal_id: draft.proposalId,
		wording: draft.wording,
		rounds_taken: draft.roundsTaken
	};
	const { error } = await supabase.from(boardroomRoomTables.outcomes).insert(row);
	if (error && !isUniqueViolation(error)) throw error;
}
