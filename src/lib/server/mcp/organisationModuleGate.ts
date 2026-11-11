import { canUseOrganisationModule } from '$lib/data/organisationModuleAccess';
import { getOrganisation } from '$lib/server/organisations/getOrganisation';
import { getSwitchedOnModules } from '$lib/server/organisations/getSwitchedOnModules';
import { organisationModuleLabels, type OrganisationModule } from '$lib/data/organisationModules';
import { readText, type McpAction } from './actionTypes';
import type { McpCaller } from './resolveMcpCaller';
import type { McpToolAnswer } from './mcpContent';
import { reachableProject } from './projectAccess';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import type { Project } from '$lib/server/projects/projectRecord';

type ModuleRun = (caller: McpCaller, input: Record<string, unknown>, organisation: Organisation) => Promise<McpToolAnswer>;

export type ModuleActionDefinition = Omit<McpAction, 'run' | 'module'> & { run: ModuleRun };

/** A product a person is on, of an organisation with the module switched on. */
export type ModuleProduct = { organisation: Organisation; project: Project };

type ProductRun = (caller: McpCaller, input: Record<string, unknown>, product: ModuleProduct) => Promise<McpToolAnswer>;

export type ProductModuleActionDefinition = Omit<McpAction, 'run' | 'module'> & { run: ProductRun };

export const moduleOrganisationField = 'organisationId';

export const moduleProductField = 'projectId';

const gatedRuns = new WeakSet<McpAction['run']>();

export function moduleNotSwitchedOn(module: OrganisationModule): string {
	const label = organisationModuleLabels[module];
	return `No organisation you are on has ${label} switched on with that id. Call list_organisations for the ones you are on.`;
}

/**
 * A connector action of a module, built so it cannot skip the one rule: it reads the organisation
 * from organisationId, asks canUseOrganisationModule, and runs only when the answer is yes.
 */
export function moduleAction(module: OrganisationModule, definition: ModuleActionDefinition): McpAction {
	const run: McpAction['run'] = async (caller, input) => {
		const organisation = await usableModuleOrganisation(caller, readText(input, moduleOrganisationField), module);
		if (organisation === null) return moduleNotSwitchedOn(module);
		return definition.run(caller, input, organisation);
	};
	gatedRuns.add(run);
	return { ...definition, module, run };
}

export function moduleNotOnProduct(module: OrganisationModule): string {
	const label = organisationModuleLabels[module];
	return `No product you are on has that id with ${label} switched on for its organisation. Call list_projects for the products you are on.`;
}

/**
 * A connector action of a module read through one product, built so it cannot skip its rule: it reads the product
 * from projectId and runs only for a person on that product, while its organisation has the module switched on.
 */
export function productModuleAction(module: OrganisationModule, definition: ProductModuleActionDefinition): McpAction {
	const run: McpAction['run'] = async (caller, input) => {
		const project = await reachableProject(caller, readText(input, moduleProductField));
		if (project === null) return moduleNotOnProduct(module);
		const organisation = await organisationWithModuleOn(caller, project.organisationId, module);
		if (organisation === null) return moduleNotOnProduct(module);
		return definition.run(caller, input, { organisation, project });
	};
	gatedRuns.add(run);
	return { ...definition, module, run };
}

export function isGatedByModuleRule(action: McpAction): boolean {
	return gatedRuns.has(action.run);
}

export async function usableModuleOrganisation(
	caller: McpCaller,
	organisationId: string,
	module: OrganisationModule
): Promise<Organisation | null> {
	const organisation = await getOrganisation(caller.supabase, organisationId);
	if (organisation === null) return null;
	const switchedOn = await getSwitchedOnModules(caller.supabase, organisation.id);
	if (!canUseOrganisationModule(caller, { organisation, switchedOn }, module)) return null;
	return organisation;
}

/** The organisation when the module is switched on for it, whoever asks; null otherwise. */
export async function organisationWithModuleOn(caller: McpCaller, organisationId: string | null, module: OrganisationModule): Promise<Organisation | null> {
	if (organisationId === null) return null;
	const organisation = await getOrganisation(caller.supabase, organisationId);
	if (organisation === null) return null;
	const switchedOn = await getSwitchedOnModules(caller.supabase, organisationId);
	const isModuleOn = switchedOn.includes(module);
	return isModuleOn ? organisation : null;
}
