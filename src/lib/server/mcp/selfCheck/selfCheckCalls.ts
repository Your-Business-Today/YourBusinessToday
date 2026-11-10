import { readActionToolName } from '../actionToolNames';
import { nextTurnToolName } from '../nextTurnToolName';
import { outstandingToolName } from '../outstandingToolName';
import type { AccountStanding } from '../resolveAccountStanding';

/** One call the self-check makes on the connector, named as a failure of it would name it. */
export type SelfCheckCall = { name: string; tool: string; arguments: Record<string, unknown> };

const actionToDescribe = 'read_task';

const toolsThatOnlyRead: SelfCheckCall[] = [
	toolCall('get_current_context', {}),
	toolCall('list_actions', {}),
	toolCall('describe_action', { name: actionToDescribe }),
	toolCall(nextTurnToolName, {}),
	toolCall(outstandingToolName, {})
];

export const readsOfTheAccount = [
	'list_projects',
	'read_build_queue',
	'read_model_settings',
	'read_autocomplete_register',
	'list_waiting_on_me'
];

export const readsOfAProject = ['read_project', 'find_tasks', 'find_goals', 'read_deploy_history', 'list_project_people'];

function toolCall(tool: string, argumentValues: Record<string, unknown>): SelfCheckCall {
	return { name: tool, tool, arguments: argumentValues };
}

function readAction(name: string, input: Record<string, unknown>): SelfCheckCall {
	return { name: `${readActionToolName} ${name}`, tool: readActionToolName, arguments: { name, input } };
}

/**
 * Every call the self-check makes on the live connector: tools that only read, and actions run through
 * the tool that refuses a write, so nothing on any board can change. The project reads need a project.
 */
export function selfCheckCalls(projectId: string | null): SelfCheckCall[] {
	const accountReads = readsOfTheAccount.map((name) => readAction(name, {}));
	if (projectId === null) return [...toolsThatOnlyRead, ...accountReads];
	const projectReads = readsOfAProject.map((name) => readAction(name, { projectId }));
	return [...toolsThatOnlyRead, ...accountReads, ...projectReads];
}

/** A project the person owns or is on, so the reads that take one read a real board. */
export function projectToReadFor(standing: AccountStanding): string | null {
	const projectIds = [...standing.ownedProjectIds, ...standing.memberProjectIds];
	return projectIds[0] ?? null;
}
