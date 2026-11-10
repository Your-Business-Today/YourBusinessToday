import { DecisionStatuses, type DecisionStatus } from '$lib/brand/decisions/decision';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A decision of an organisation's kit, as far as changing its status needs it. */
export type BrandDecisionStanding = { id: string; traitKey: string; mediumPath: string; status: DecisionStatus };

export type BrandDecisionPlace = { organisationId: string; traitKey: string; mediumPath: string };

const uniqueViolation = '23505';

/** The decision of the organisation's kit with that id, or null when the kit holds none. */
export async function findBrandDecision(
	supabase: SupabaseClient,
	organisationId: string,
	decisionId: string
): Promise<BrandDecisionStanding | null> {
	const { data, error } = await supabase
		.from('brand_kit_decisions')
		.select('id, trait_key, medium_path, status')
		.eq('organisation_id', organisationId)
		.eq('id', decisionId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	const { id, trait_key: traitKey, medium_path: mediumPath, status } = data;
	return { id, traitKey, mediumPath, status } as BrandDecisionStanding;
}

/** Retires the decision adopted at the place, if there is one. Its row stays, so nothing decided is lost. */
export async function retireAdoptedAt(supabase: SupabaseClient, place: BrandDecisionPlace): Promise<void> {
	const { error } = await supabase
		.from('brand_kit_decisions')
		.update(statusChangedTo(DecisionStatuses.retired))
		.eq('organisation_id', place.organisationId)
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
	const { error } = await supabase.from('brand_kit_decisions').update(statusChangedTo(status)).eq('id', decision.id);
	if (error?.code === uniqueViolation) return false;
	if (error) throw error;
	return true;
}

function statusChangedTo(status: DecisionStatus): Record<string, string> {
	return { status, status_changed_at: new Date().toISOString() };
}
