import type { SupabaseClient } from '@supabase/supabase-js';
import { boardDecisionTables } from './boardroomDecisionRecord';
import { isUniqueViolation } from './saveBoardroomRoom';
import type { BoardroomMeeting } from '$lib/data/boardroomMeeting';
import type { DecisionRule } from '$lib/data/boardroomDecision';
import type { PutDecision } from '$lib/data/boardDecisionOnItem';
import type { DecisionAnswerDraft } from '$lib/data/validateDecisionAnswer';

function decisionRowOf(meeting: BoardroomMeeting, decision: PutDecision, openedBy: string) {
	const { rule } = decision;
	return {
		organisation_id: meeting.organisationId,
		meeting_id: meeting.id,
		agenda_item_id: decision.agendaItemId,
		proposal_id: decision.proposalId,
		wording: decision.wording,
		chair_director_id: decision.chairDirectorId,
		rule_source: rule.source,
		quorum: rule.quorum,
		agreement: rule.agreement,
		chair_has_casting_vote: rule.hasChairCastingVote,
		articles_reference: rule.articlesReference,
		replaces_decision_id: decision.replacesDecisionId,
		opened_by: openedBy
	};
}

async function keptDecisionIdOfItem(supabase: SupabaseClient, agendaItemId: string): Promise<string> {
	const { data, error } = await supabase.from(boardDecisionTables.decisions).select('id').eq('agenda_item_id', agendaItemId).single();
	if (error) throw error;
	return data.id as string;
}

/** Puts a decision to the directors with the rule in force now, once; when it was put already, gives the one kept. */
export async function insertBoardDecision(supabase: SupabaseClient, meeting: BoardroomMeeting, decision: PutDecision, openedBy: string): Promise<string> {
	const row = decisionRowOf(meeting, decision, openedBy);
	const { data, error } = await supabase.from(boardDecisionTables.decisions).insert(row).select('id').single();
	if (isUniqueViolation(error)) return keptDecisionIdOfItem(supabase, decision.agendaItemId);
	if (error) throw error;
	return data.id as string;
}

/** One director's own answer as it is kept: the decision, the seat, and the account that gave it. */
export type DecisionAnswerPlacing = { meeting: BoardroomMeeting; decisionId: string; seatId: string; answeredBy: string };

/** Keeps a director's answer as they gave it; false when their seat has answered this decision already. */
export async function insertDecisionAnswer(supabase: SupabaseClient, placing: DecisionAnswerPlacing, draft: DecisionAnswerDraft): Promise<boolean> {
	const { meeting } = placing;
	const row = {
		decision_id: placing.decisionId,
		director_id: placing.seatId,
		organisation_id: meeting.organisationId,
		meeting_id: meeting.id,
		answer: draft.answer,
		reason: draft.reason,
		answered_by: placing.answeredBy
	};
	const { error } = await supabase.from(boardDecisionTables.answers).insert(row);
	if (isUniqueViolation(error)) return false;
	if (error) throw error;
	return true;
}

/** Who records a company's own rule: the organisation, the director's seat, and the account. */
export type RulePlacing = { organisationId: string; seatId: string; recordedBy: string };

export async function insertDecisionRule(supabase: SupabaseClient, placing: RulePlacing, rule: DecisionRule): Promise<void> {
	const row = {
		organisation_id: placing.organisationId,
		quorum: rule.quorum,
		agreement: rule.agreement,
		chair_has_casting_vote: rule.hasChairCastingVote,
		articles_reference: rule.articlesReference,
		recorded_by_director_id: placing.seatId,
		recorded_by: placing.recordedBy
	};
	const { error } = await supabase.from(boardDecisionTables.rules).insert(row);
	if (error) throw error;
}
