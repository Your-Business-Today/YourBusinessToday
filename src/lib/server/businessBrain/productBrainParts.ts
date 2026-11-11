import type { SupabaseClient } from '@supabase/supabase-js';
import { businessBrainPartKinds, type BusinessBrainPartKind } from '$lib/data/businessBrainRules';
import { ensurePartIds } from './grantBusinessBrainChatbot';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { readPartKinds } from './readBusinessBrainIndex';
import type { ProductBrainPlace, ProductBrainTying } from '$lib/data/productBrainRules';

const productPartsTable = 'business_brain_product_parts';

/** The parts of the organisation's brain tied to the product now, in the brain's order; none before migration 0201 has run. */
export async function readPartsTiedTo(supabase: SupabaseClient, place: ProductBrainPlace): Promise<BusinessBrainPartKind[]> {
	const { data, error } = await supabase
		.from(productPartsTable)
		.select('part_id')
		.eq('organisation_id', place.organisationId)
		.eq('project_id', place.projectId)
		.is('untied_at', null);
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	const partKinds = await readPartKinds(supabase, place.organisationId);
	const tiedKinds = (data ?? []).map((row) => partKinds.get(row.part_id as string));
	return businessBrainPartKinds.filter((kind) => tiedKinds.includes(kind));
}

/** Tie each part to the product; the part is made first if nothing is filed in it yet. */
export async function tieProductBrainParts(supabase: SupabaseClient, tying: ProductBrainTying, parts: BusinessBrainPartKind[]): Promise<void> {
	if (parts.length === 0) return;
	const partIds = await ensurePartIds(supabase, tying.organisationId, parts);
	const rows = partIds.map((partId) => ({ ...tieColumns(tying), part_id: partId }));
	const { error } = await supabase.from(productPartsTable).insert(rows);
	if (error) throw error;
}

/** Untie each part from the product by dating its tie, so the record of what the product read stays. */
export async function untieProductBrainParts(supabase: SupabaseClient, tying: ProductBrainTying, parts: BusinessBrainPartKind[]): Promise<void> {
	if (parts.length === 0) return;
	const partKinds = await readPartKinds(supabase, tying.organisationId);
	const partIds = [...partKinds.keys()].filter((partId) => parts.includes(partKinds.get(partId) as BusinessBrainPartKind));
	const { error } = await supabase
		.from(productPartsTable)
		.update({ untied_at: new Date().toISOString(), untied_by: tying.accountId })
		.eq('organisation_id', tying.organisationId)
		.eq('project_id', tying.projectId)
		.in('part_id', partIds)
		.is('untied_at', null);
	if (error) throw error;
}

function tieColumns(tying: ProductBrainTying) {
	return { organisation_id: tying.organisationId, project_id: tying.projectId, tied_by: tying.accountId };
}
