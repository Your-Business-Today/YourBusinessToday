import { canEnterBoardroom } from '$lib/data/boardroomAccess';
import { getDirectorsOfOrganisation } from '$lib/server/boardroom/getDirectorsOfOrganisation';
import { getSwitchedOnModules } from '$lib/server/organisations/getSwitchedOnModules';
import { moduleAction, type ModuleActionDefinition } from './organisationModuleGate';
import type { McpAction } from './actionTypes';

export const notADirector =
	'No organisation whose boardroom you may enter has that id. Only its named directors enter; call list_organisations for the ones you are on.';

const directorCheckedRuns = new WeakSet<McpAction['run']>();

/**
 * A connector action of the Boardroom, built so it cannot skip either check: moduleAction asks the
 * one module rule first, then this asks canEnterBoardroom, and the action runs only on two yeses.
 */
export function boardroomAction(definition: ModuleActionDefinition): McpAction {
	const action = moduleAction('boardroom', {
		...definition,
		run: async (caller, input, organisation) => {
			const [switchedOn, directors] = await Promise.all([
				getSwitchedOnModules(caller.supabase, organisation.id),
				getDirectorsOfOrganisation(caller.supabase, organisation.id)
			]);
			if (!canEnterBoardroom(caller, { organisation, switchedOn, directors })) return notADirector;
			return definition.run(caller, input, organisation);
		}
	});
	directorCheckedRuns.add(action.run);
	return action;
}

export function isGatedByDirectorRule(action: McpAction): boolean {
	return directorCheckedRuns.has(action.run);
}
