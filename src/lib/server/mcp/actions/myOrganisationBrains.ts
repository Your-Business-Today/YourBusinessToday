import { getProject } from '$lib/server/projects/getProject';
import { organisationWithModuleOn, usableModuleOrganisation } from '../organisationModuleGate';
import { readPartsTiedTo, readProductsWithBrains } from '$lib/server/businessBrain/productBrainParts';
import { reachableProjectIds } from '../projectAccess';
import { searchBusinessBrain, searchBusinessBrainParts } from '$lib/server/businessBrain/searchBusinessBrain';
import { brainOf } from './businessBrainAnswers';
import type { BrainSearchScope, BrainSearched } from '$lib/data/myBrainsRules';
import type { McpCaller } from '../resolveMcpCaller';
import type { ProductBrainPlace } from '$lib/data/productBrainRules';

const businessBrainModule = 'business_brain';

/** The whole brain of every organisation in scope the person is on, with Your Business Brain switched on. */
export async function searchOrganisationBrains(caller: McpCaller, scope: BrainSearchScope): Promise<BrainSearched[]> {
	const organisationIds = [...new Set(caller.organisationMemberships.map((membership) => membership.organisationId))];
	const inScope = organisationIds.filter((organisationId) => isInScope(scope, organisationId));
	const searched = await Promise.all(inScope.map((organisationId) => searchOrganisationBrain(caller, scope, organisationId)));
	return searched.filter((brain): brain is BrainSearched => brain !== null);
}

/** The brain of every product in scope the person is on that has parts tied to it, with Your Business Brain switched on. */
export async function searchProductBrains(caller: McpCaller, scope: BrainSearchScope): Promise<BrainSearched[]> {
	const products = await readProductsWithBrains(caller.supabase, reachableProjectIds(caller));
	const inScope = products.filter((product) => isInScope(scope, product.organisationId));
	const searched = await Promise.all(inScope.map((product) => searchProductBrain(caller, scope, product)));
	return searched.filter((brain): brain is BrainSearched => brain !== null);
}

async function searchOrganisationBrain(caller: McpCaller, scope: BrainSearchScope, organisationId: string): Promise<BrainSearched | null> {
	const organisation = await usableModuleOrganisation(caller, organisationId, businessBrainModule);
	if (organisation === null) return null;
	const matches = await searchBusinessBrain(caller.supabase, organisation.id, scope.searchText);
	const readOnWith = `read_business_brain_page with organisationId ${organisation.id}`;
	return { name: `${brainOf(organisation)}, whole`, purpose: `Everything ${organisation.name} has filed`, readOnWith, pagesFound: matches ?? [] };
}

async function searchProductBrain(caller: McpCaller, scope: BrainSearchScope, product: ProductBrainPlace): Promise<BrainSearched | null> {
	const { supabase } = caller;
	const organisation = await organisationWithModuleOn(caller, product.organisationId, businessBrainModule);
	const project = await getProject(supabase, product.projectId);
	if (organisation === null || project === null) return null;
	const parts = await readPartsTiedTo(supabase, product);
	const matches = await searchBusinessBrainParts(supabase, product.organisationId, scope.searchText, parts);
	const readOnWith = `read_product_brain_page with projectId ${project.id}`;
	return { name: `The brain of ${project.name}`, purpose: `What ${organisation.name} ties to ${project.name}`, readOnWith, pagesFound: matches ?? [] };
}

function isInScope(scope: BrainSearchScope, organisationId: string): boolean {
	return scope.organisationId === null || scope.organisationId === organisationId;
}
