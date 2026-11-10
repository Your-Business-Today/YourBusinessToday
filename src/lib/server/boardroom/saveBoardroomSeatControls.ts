import type { SupabaseClient } from '@supabase/supabase-js';
import { seatControlTables } from './boardroomSeatControlRecord';
import type { BoardroomMeeting } from '$lib/data/boardroomMeeting';
import type { HeldAnswerKind } from '$lib/data/boardroomSeatControls';
import type { SettingDraft } from '$lib/data/validateSeatControl';
import type { ContributionPlacing } from './saveBoardroomRoom';

/** Whose seat a director's note, setting or answer is for, on which meeting, and the account that gave it. */
export type SeatPlacing = { meeting: BoardroomMeeting; seatId: string; givenBy: string };

function seatRowOf(placing: SeatPlacing) {
	const { meeting } = placing;
	return { organisation_id: meeting.organisationId, meeting_id: meeting.id, director_id: placing.seatId };
}

async function insertRow(supabase: SupabaseClient, table: string, row: Record<string, unknown>): Promise<void> {
	const { error } = await supabase.from(table).insert(row);
	if (error) throw error;
}

export async function insertSteerNote(supabase: SupabaseClient, placing: SeatPlacing, words: string): Promise<void> {
	await insertRow(supabase, seatControlTables.steerNotes, { ...seatRowOf(placing), words, written_by: placing.givenBy });
}

export async function insertSeatSetting(supabase: SupabaseClient, placing: SeatPlacing, change: SettingDraft): Promise<void> {
	const row = { ...seatRowOf(placing), setting: change.setting, is_on: change.isOn, changed_by: placing.givenBy };
	await insertRow(supabase, seatControlTables.settings, row);
}

/** Holds what a Claude is about to say for its director's yes, placed as the room placed it. */
export async function insertHeldContribution(supabase: SupabaseClient, placing: ContributionPlacing): Promise<void> {
	const seat = { meeting: placing.meeting, seatId: placing.seatId, givenBy: placing.spokenBy };
	const row = {
		...seatRowOf(seat),
		agenda_item_id: placing.agendaItemId,
		held_by: placing.spokenBy,
		stance: placing.stance,
		words: placing.words,
		wording: placing.wording,
		on_proposal_id: placing.onProposalId,
		corrects_id: placing.correctsId
	};
	await insertRow(supabase, seatControlTables.held, row);
}

/** The director's answer to a held piece: said, with the contribution it became, or kept unsaid. */
export type HeldAnswerPlacing = { heldId: string; answer: HeldAnswerKind; contributionId: string | null };

export async function insertHeldAnswer(supabase: SupabaseClient, placing: SeatPlacing, answer: HeldAnswerPlacing): Promise<void> {
	const row = {
		...seatRowOf(placing),
		held_id: answer.heldId,
		answer: answer.answer,
		contribution_id: answer.contributionId,
		answered_by: placing.givenBy
	};
	await insertRow(supabase, seatControlTables.answers, row);
}
