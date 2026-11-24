import { DecisionStatuses, type DecisionStatus } from '$lib/brand/decisions/decision';
import type { BrandKitOwner } from './brandKitOwner';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A decision of a brand's kit, as far as changing its status needs it. */
export type BrandDecisionStanding = { owner: BrandKitOwner; id: string; traitKey: string; mediumPath: string; status: DecisionStatus };

export type BrandDecisionPlace = { owner: BrandKitOwner; traitKey: string; mediumPath: string };

const uniqueViolation = '23505';

/** The decision of the brand's kit with that id, or null when the kit holds none. */
export async function findBrandDecision(
	supabase: SupabaseClient,
	owner: BrandKitOwner,
	decisionId: string
): Promise<BrandDecisionStanding | null> {
	const { data, error } = await supabase
		.from(owner.decisionsTable)
		.select('id, trait_key, medium_path, status')
		.eq(owner.ownerColumn, owner.ownerId)
		.eq('id', decisionId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	const { id, trait_key: traitKey, medium_path: mediumPath, status } = data;
	return { owner, id, traitKey, mediumPath, status } as BrandDecisionStanding;
}

/** Retires the decision adopted at the place, if there is one. Its row stays, so nothing decided is lost. */
export async function retireAdoptedAt(supabase: SupabaseClient, place: BrandDecisionPlace): Promise<void> {
	const { owner } = place;
	const { error } = await supabase
		.from(owner.decisionsTable)
		.update(statusChangedTo(DecisionStatuses.retired))
		.eq(owner.ownerColumn, owner.ownerId)
		.eq('trait_key', place.traitKey)
		.eq('medium_path', place.mediumPath)
		.eq('status', DecisionStatuses.adopted);
	if (error) throw error;
}

/** Moves one decision to the status, keeping its row and value; false when another was adopted in its place meanwhile. */
export async function changeDecisionStatus(
	supabase: SupabaseClient,
	decision: BrandDecisionStanding,
	status: DecisionStatus
): Promise<boolean> {
	const { owner } = decision;
	const { error } = await supabase.from(owner.decisionsTable).update(statusChangedTo(status)).eq('id', decision.id);
	if (error?.code === uniqueViolation) return false;
	if (error) throw error;
	return true;
}

function statusChangedTo(status: DecisionStatus): Record<string, string> {
	return { status, status_changed_at: new Date().toISOString() };
}
