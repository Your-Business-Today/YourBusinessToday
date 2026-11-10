import { contributionStances } from '$lib/data/boardroomRoom';
import {
	allSeatSettings,
	heldAnswers,
	seatSettings,
	type HeldAnswerKind,
	type HeldContribution,
	type SeatSettingChange,
	type SteerNote
} from '$lib/data/boardroomSeatControls';

export const seatControlTables = {
	steerNotes: 'boardroom_steer_notes',
	settings: 'boardroom_seat_settings',
	held: 'boardroom_held_contributions',
	answers: 'boardroom_held_contribution_answers'
} as const;

export const steerNoteColumns = 'id, words, created_at';
export const seatSettingColumns = 'id, setting, is_on, changed_at';
export const heldContributionColumns = 'id, agenda_item_id, stance, words, wording, on_proposal_id, corrects_id, created_at';
export const heldAnswerColumns = 'held_id, answer';

export function parseSteerNoteRecord(row: Record<string, unknown>): SteerNote {
	return { id: row.id as string, words: String(row.words ?? ''), writtenAt: row.created_at as string };
}

export function parseSeatSettingRecord(row: Record<string, unknown>): SeatSettingChange {
	const setting = allSeatSettings.find((known) => known === row.setting) ?? seatSettings.paused;
	return { id: row.id as string, setting, isOn: row.is_on === true, changedAt: row.changed_at as string };
}

export function parseHeldContributionRecord(row: Record<string, unknown>, answer: HeldAnswerKind | null): HeldContribution {
	return {
		id: row.id as string,
		agendaItemId: row.agenda_item_id as string,
		stance: contributionStances.find((stance) => stance === row.stance) ?? 'comments',
		words: String(row.words ?? ''),
		wording: (row.wording as string | null) ?? null,
		onProposalId: (row.on_proposal_id as string | null) ?? null,
		correctsId: (row.corrects_id as string | null) ?? null,
		heldAt: row.created_at as string,
		answer
	};
}

export function parseHeldAnswerKind(row: Record<string, unknown>): HeldAnswerKind {
	return row.answer === heldAnswers.said ? heldAnswers.said : heldAnswers.keptUnsaid;
}
