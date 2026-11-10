import { contributionStances, outcomeKinds, type BoardContribution, type BoardroomRoom, type ItemOutcome } from '$lib/data/boardroomRoom';

export const boardroomRoomTables = {
	rooms: 'boardroom_rooms',
	contributions: 'boardroom_contributions',
	outcomes: 'boardroom_item_outcomes'
} as const;

export const boardroomRoomColumns = 'meeting_id, rounds_limit, opened_by_director_id, opened_at';

export const boardContributionColumns =
	'id, agenda_item_id, director_id, round, stance, words, wording, on_proposal_id, corrects_id, created_at';

export const itemOutcomeColumns = 'agenda_item_id, outcome, proposal_id, wording, rounds_taken, reached_at';

export function parseBoardroomRoomRecord(row: Record<string, unknown>): BoardroomRoom {
	return {
		meetingId: row.meeting_id as string,
		roundsLimit: Number(row.rounds_limit),
		openedByDirectorId: row.opened_by_director_id as string,
		openedAt: row.opened_at as string
	};
}

export function parseBoardContributionRecord(row: Record<string, unknown>): BoardContribution {
	return {
		id: row.id as string,
		agendaItemId: row.agenda_item_id as string,
		directorId: row.director_id as string,
		round: Number(row.round),
		stance: contributionStances.find((stance) => stance === row.stance) ?? 'comments',
		words: String(row.words ?? ''),
		wording: (row.wording as string | null) ?? null,
		onProposalId: (row.on_proposal_id as string | null) ?? null,
		correctsId: (row.corrects_id as string | null) ?? null,
		createdAt: row.created_at as string
	};
}

export function parseItemOutcomeRecord(row: Record<string, unknown>): ItemOutcome {
	const isAgreed = row.outcome === outcomeKinds.agreed;
	return {
		agendaItemId: row.agenda_item_id as string,
		outcome: isAgreed ? outcomeKinds.agreed : outcomeKinds.notAgreed,
		proposalId: (row.proposal_id as string | null) ?? null,
		wording: (row.wording as string | null) ?? null,
		roundsTaken: Number(row.rounds_taken),
		reachedAt: row.reached_at as string
	};
}
