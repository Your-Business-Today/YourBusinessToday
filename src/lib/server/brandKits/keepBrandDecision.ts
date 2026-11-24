import { connectorSource, DecisionStatuses, type CheckedDecision, type RecordedStatus } from '$lib/brand/decisions/decision';
import { retireAdoptedAt } from './brandDecisionStatus';
import type { BrandKitOwner } from './brandKitOwner';
import type { SupabaseClient } from '@supabase/supabase-js';

export type DecisionToKeep = CheckedDecision & { rationale: string };

export type DecisionKeeping = { owner: BrandKitOwner; accountId: string; status: RecordedStatus };

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
	const { owner, status } = keeping;
	const isAdopted = status === DecisionStatuses.adopted;
	if (isAdopted) await retireAdoptedAt(supabase, { owner, ...decision });
	const { data, error } = await supabase.from(owner.decisionsTable).insert(rowOf(keeping, decision)).select('id').single();
	if (error?.code === uniqueViolation) return null;
	if (error) throw error;
	return data.id as string;
}

function rowOf(keeping: DecisionKeeping, decision: DecisionToKeep): Record<string, unknown> {
	const { owner } = keeping;
	return {
		[owner.ownerColumn]: owner.ownerId,
		trait_key: decision.traitKey,
		medium_path: decision.mediumPath,
		value: decision.value,
		rationale: decision.rationale,
		source: connectorSource,
		status: keeping.status,
		decided_by: keeping.accountId
	};
}
