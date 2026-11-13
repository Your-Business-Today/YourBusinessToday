import type { SupabaseClient } from '@supabase/supabase-js';
import type { MapLine, WorkflowMapDraft } from '$lib/data/workflowMap/workflowMap';
import type { Refusal } from '$lib/server/portal/portalFormReading';

/** Every product a map's stations name, by id. */
export function productIdsOf(lines: MapLine[]): string[] {
	const named = lines.flatMap((line) => line.stations.map((station) => station.productId));
	return [...new Set(named.filter((productId) => productId !== null))];
}

/** The names of those of the given products that belong to the organisation, by id. */
export async function readOrganisationProducts(
	supabase: SupabaseClient,
	organisationId: string,
	productIds: string[]
): Promise<Map<string, string>> {
	if (productIds.length === 0) return new Map();
	const { data, error } = await supabase
		.from('projects')
		.select('id, name')
		.eq('organisation_id', organisationId)
		.in('id', productIds);
	if (error) throw error;
	return new Map(data.map((row) => [String(row.id), String(row.name)]));
}

/** Refuses a station that names a product of another organisation, or none at all. */
export async function refuseStrayProducts(
	supabase: SupabaseClient,
	organisationId: string,
	draft: WorkflowMapDraft
): Promise<Refusal | null> {
	const productIds = productIdsOf(draft.lines);
	const products = await readOrganisationProducts(supabase, organisationId, productIds);
	const strayId = productIds.find((productId) => !products.has(productId));
	if (strayId === undefined) return null;
	return { refusal: `productId ${strayId} is not a product of this organisation: list_projects gives its products.` };
}
