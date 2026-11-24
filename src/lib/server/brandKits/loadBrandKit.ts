import { catalogueWith } from '$lib/brand/traits/traitCatalogue';
import type { Decision } from '$lib/brand/decisions/decision';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { TraitDefinition } from '$lib/brand/traits/traitDefinition';
import type { BrandKitOwner } from './brandKitOwner';

export type BrandKit = { catalogue: TraitDefinition[]; decisions: Decision[] };

const RetiredStatus = 'retired';
const traitColumns = 'key, facet, kind, label, purpose, choices';
const decisionColumns = 'id, trait_key, medium_path, value, rationale, source, status, created_at';

/** A brand's kit: the catalogue with the brand's own traits in it, and every decision not retired. */
export async function loadBrandKit(supabase: SupabaseClient, owner: BrandKitOwner): Promise<BrandKit> {
	const [ownTraits, decisions] = await Promise.all([loadOwnTraits(supabase, owner), loadDecisions(supabase, owner)]);
	return { catalogue: catalogueWith(ownTraits), decisions };
}

async function loadOwnTraits(supabase: SupabaseClient, owner: BrandKitOwner): Promise<TraitDefinition[]> {
	const { data, error } = await supabase
		.from(owner.traitsTable)
		.select(traitColumns)
		.eq(owner.ownerColumn, owner.ownerId);
	if (error) throw error;
	return (data ?? []).map((row) => ({ ...row, isCustom: true }));
}

async function loadDecisions(supabase: SupabaseClient, owner: BrandKitOwner): Promise<Decision[]> {
	const { data, error } = await supabase
		.from(owner.decisionsTable)
		.select(decisionColumns)
		.eq(owner.ownerColumn, owner.ownerId)
		.neq('status', RetiredStatus)
		.order('created_at');
	if (error) throw error;
	return (data ?? []).map(parseDecision);
}

function parseDecision(row: Record<string, unknown>): Decision {
	return {
		id: row.id as string,
		traitKey: row.trait_key as string,
		mediumPath: row.medium_path as string,
		value: row.value as Decision['value'],
		rationale: row.rationale as string,
		source: row.source as Decision['source'],
		status: row.status as Decision['status'],
		decidedAt: row.created_at as string
	};
}
