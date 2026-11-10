import { connectorSource, DecisionStatuses, type CheckedDecision, type RecordedStatus } from '$lib/brand/decisions/decision';
import { retireAdoptedAt } from './brandDecisionStatus';
import type { SupabaseClient } from '@supabase/supabase-js';

export type DecisionToKeep = CheckedDecision & { rationale: string };

export type DecisionKeeping = { organisationId: string; accountId: string; status: RecordedStatus };

const uniqueViolation = '23505';

/**
 * Keeps one checked decision. An adopted one first retires the decision adopted at the same trait
 * and medium, whose row stays; null when another was adopted there in the same moment.
 */
export async function keepBrandDecision(
	supabase: SupabaseClient,
	keeping: DecisionKeeping,
	decision: DecisionToKeep
): Promise<string | null> {
	const { organisationId, status } = keeping;
	const isAdopted = status === DecisionStatuses.adopted;
	if (isAdopted) await retireAdoptedAt(supabase, { organisationId, ...decision });
	const { data, error } = await supabase.from('brand_kit_decisions').insert(rowOf(keeping, decision)).select('id').single();
	if (error?.code === uniqueViolation) return null;
	if (error) throw error;
	return data.id as string;
}

function rowOf(keeping: DecisionKeeping, decision: DecisionToKeep): Record<string, unknown> {
	return {
		organisation_id: keeping.organisationId,
		trait_key: decision.traitKey,
		medium_path: decision.mediumPath,
		value: decision.value,
		rationale: decision.rationale,
		source: connectorSource,
		status: keeping.status,
		decided_by: keeping.accountId
	};
}
