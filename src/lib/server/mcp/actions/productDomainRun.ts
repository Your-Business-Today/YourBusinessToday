import { describeProductDomainRun } from './describeProductDomainRun';
import { getProjectBlueprint } from '$lib/server/blueprint/getProjectBlueprint';
import { organisationDomainOf } from '$lib/server/businessBrain/organisationDomainOf';
import { productDomainHolder } from './domainHolder';
import { readDomainPages } from '$lib/server/businessBrain/readDomainPages';
import { readDomainSources } from '$lib/server/businessBrain/readDomainSources';
import type { McpCaller } from '../resolveMcpCaller';
import type { ModuleProduct } from '../organisationModuleGate';

/** The walk a person's Claude follows to set a product's own domain, fitted to what is held already. */
export async function startProductDomainRun(caller: McpCaller, _input: Record<string, unknown>, product: ModuleProduct): Promise<string> {
	const { supabase } = caller;
	const { organisation, project } = product;
	const holder = productDomainHolder(product);
	const { scope } = holder;
	const [pages, sources, blueprint, organisationPages] = await Promise.all([
		readDomainPages(supabase, scope),
		readDomainSources(supabase, scope),
		getProjectBlueprint(supabase, project.id),
		readDomainPages(supabase, { organisationId: organisation.id, projectId: null })
	]);
	return describeProductDomainRun({
		holder,
		organisationName: organisation.name,
		domain: organisationDomainOf(pages),
		sources,
		repositoryUrl: project.repositoryUrl,
		repositoryDomain: blueprint?.domain ?? null,
		organisationDomain: organisationDomainOf(organisationPages)
	});
}
