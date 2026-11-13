import { usableModuleOrganisation } from '../organisationModuleGate';
import { searchBusinessBrain } from '$lib/server/businessBrain/searchBusinessBrain';
import { brainOf } from './businessBrainAnswers';
import type { BrainSearchScope, BrainSearched } from '$lib/data/myBrainsRules';
import type { McpCaller } from '../resolveMcpCaller';

const businessBrainModule = 'business_brain';

/** The whole brain of every organisation in scope the person is on, with Your Business Brain switched on. */
export async function searchOrganisationBrains(caller: McpCaller, scope: BrainSearchScope): Promise<BrainSearched[]> {
	const organisationIds = [...new Set(caller.organisationMemberships.map((membership) => membership.organisationId))];
	const inScope = organisationIds.filter((organisationId) => isInScope(scope, organisationId));
	const searched = await Promise.all(inScope.map((organisationId) => searchOrganisationBrain(caller, scope, organisationId)));
	return searched.filter((brain): brain is BrainSearched => brain !== null);
}

async function searchOrganisationBrain(caller: McpCaller, scope: BrainSearchScope, organisationId: string): Promise<BrainSearched | null> {
	const organisation = await usableModuleOrganisation(caller, organisationId, businessBrainModule);
	if (organisation === null) return null;
	const matches = await searchBusinessBrain(caller.supabase, organisation.id, scope.searchText);
	const readOnWith = `read_business_brain_page with organisationId ${organisation.id}`;
	return { name: `${brainOf(organisation)}, whole`, purpose: `Everything ${organisation.name} has filed`, readOnWith, pagesFound: matches ?? [] };
}

function isInScope(scope: BrainSearchScope, organisationId: string): boolean {
	return scope.organisationId === null || scope.organisationId === organisationId;
}
