import type { SupabaseClient } from '@supabase/supabase-js';
import { getDirectorsOfOrganisation } from './getDirectorsOfOrganisation';
import { insertDecisionRule } from './saveBoardroomDecisions';
import { sittingSeatOf } from '$lib/data/boardroomDirector';
import { boardDecisionRefusals } from '$lib/data/boardroomDecisionRules';
import { decisionRuleRecordedWords } from '$lib/data/describeDecisionRule';
import type { DecisionRule } from '$lib/data/boardroomDecision';
import type { RoomCaller } from '$lib/data/placeBoardContribution';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/**
 * A sitting director records how the company's own articles say its directors' decisions carry. It is kept as a
 * new rule beside the earlier ones, and only decisions put from now on are decided by it.
 */
export async function recordDecisionRule(
	supabase: SupabaseClient,
	organisation: Organisation,
	rule: DecisionRule,
	caller: RoomCaller
): Promise<string> {
	const directors = await getDirectorsOfOrganisation(supabase, organisation.id);
	const seat = sittingSeatOf(directors, caller.accountId);
	if (seat === null) return boardDecisionRefusals.callerNotSitting;
	await insertDecisionRule(supabase, { organisationId: organisation.id, seatId: seat.id, recordedBy: caller.accountId }, rule);
	return decisionRuleRecordedWords(organisation.name, rule);
}
