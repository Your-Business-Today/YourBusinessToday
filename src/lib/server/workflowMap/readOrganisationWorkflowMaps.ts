import { productIdsOf, readProductsOfOrganisation } from './mapProducts';
import { readLatestWorkflowMap } from './readLatestWorkflowMap';
import { mapStage } from '$lib/data/workflowMap/workflowMap';
import type { OrganisationWorkflowMaps } from '$lib/data/workflowMap/organisationWorkflowMaps';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The organisation's latest Before and After, read whole, with the names of the products their stations are done in. */
export async function readOrganisationWorkflowMaps(supabase: SupabaseClient, organisationId: string): Promise<OrganisationWorkflowMaps> {
	const [before, after] = await Promise.all([
		readLatestWorkflowMap(supabase, organisationId, mapStage.before),
		readLatestWorkflowMap(supabase, organisationId, mapStage.after)
	]);
	const filedLines = [before, after].flatMap((version) => version?.lines ?? []);
	const products = await readProductsOfOrganisation(supabase, organisationId, productIdsOf(filedLines));
	return { before, after, productNames: Object.fromEntries(products) };
}
