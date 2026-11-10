import { canUseOrganisationModule } from '$lib/data/organisationModuleAccess';
import { getOrganisation } from '$lib/server/organisations/getOrganisation';
import { getSwitchedOnModules } from '$lib/server/organisations/getSwitchedOnModules';
import { organisationModuleLabels, type OrganisationModule } from '$lib/data/organisationModules';
import { readText, type McpAction } from './actionTypes';
import type { McpCaller } from './resolveMcpCaller';
import type { McpToolAnswer } from './mcpContent';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

type ModuleRun = (caller: McpCaller, input: Record<string, unknown>, organisation: Organisation) => Promise<McpToolAnswer>;

export type ModuleActionDefinition = Omit<McpAction, 'run' | 'module'> & { run: ModuleRun };

export const moduleOrganisationField = 'organisationId';

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
