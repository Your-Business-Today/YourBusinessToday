import { catalogueWith } from '$lib/brand/traits/traitCatalogue';
import type { Decision } from '$lib/brand/decisions/decision';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { TraitDefinition } from '$lib/brand/traits/traitDefinition';

export type BrandKit = { catalogue: TraitDefinition[]; decisions: Decision[] };

const RetiredStatus = 'retired';
const traitColumns = 'key, facet, kind, label, purpose, choices';
const decisionColumns = 'id, trait_key, medium_path, value, rationale, source, status, created_at';

/** An organisation's kit: the catalogue with the brand's own traits in it, and every decision not retired. */
export async function loadBrandKit(supabase: SupabaseClient, organisationId: string): Promise<BrandKit> {
	const [ownTraits, decisions] = await Promise.all([
		loadOwnTraits(supabase, organisationId),
		loadDecisions(supabase, organisationId)
	]);
	return { catalogue: catalogueWith(ownTraits), decisions };
}

async function loadOwnTraits(supabase: SupabaseClient, organisationId: string): Promise<TraitDefinition[]> {
	const { data, error } = await supabase
		.from('brand_kit_traits')
		.select(traitColumns)
		.eq('organisation_id', organisationId);
	if (error) throw error;
	return (data ?? []).map((row) => ({ ...row, isCustom: true }));
}

async function loadDecisions(supabase: SupabaseClient, organisationId: string): Promise<Decision[]> {
	const { data, error } = await supabase
		.from('brand_kit_decisions')
		.select(decisionColumns)
		.eq('organisation_id', organisationId)
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
