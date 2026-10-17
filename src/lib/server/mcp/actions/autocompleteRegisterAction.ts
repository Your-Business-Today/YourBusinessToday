import { autocompleteWord } from '$lib/data/autocomplete';
import {
	countAutocomplete,
	countOpenTasks,
	type RegisterGoal,
	type RegisterProject,
	type RegisterTask
} from '$lib/server/autocomplete/autocompleteRegisterRecord';
import { getAutocompleteRegister } from '$lib/server/autocomplete/getAutocompleteRegister';
import { noReachableProject, reachableProjectIds } from '../projectAccess';
import { objectSchema, readOptionalText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';

export const registerReadAction: McpAction = {
	name: 'read_autocomplete_register',
	area: 'tasks',
	audience: 'everyone',
	isWrite: false,
	summary:
		'the autocomplete register: how many open tasks each project lets scheduled AIs complete, ' +
		'or every open goal and task on one project, on or off',
	inputSchema: objectSchema({
		projectId: textField('One project, to list its goals and tasks — leave out for every project')
	}),
	run: async (caller, input) => {
		const projectId = readOptionalText(input, 'projectId');
		const projectIds = validateRegisterScope(projectId, reachableProjectIds(caller));
		if (projectIds === null) return noReachableProject;
		const register = await getAutocompleteRegister(caller.supabase, projectIds);
		const isOneProject = projectId !== null;
		const lines = isOneProject ? register.flatMap(projectLines) : register.map(projectCountLine);
		return lines.join('\n');
	}
};

/** The projects the register reads: every reachable one, or the one asked for when it is reachable. */
function validateRegisterScope(projectId: string | null, reachable: string[]): string[] | null {
	if (projectId === null) return reachable;
	const isReachable = reachable.includes(projectId);
	return isReachable ? [projectId] : null;
}

function projectCountLine(project: RegisterProject): string {
	const counts = `${countAutocomplete(project)} of ${countOpenTasks(project)} open tasks autocomplete`;
	return `${project.name} — ${counts} (id: ${project.id})`;
}

function projectLines(project: RegisterProject): string[] {
	return [
		projectCountLine(project),
		'Open goals:',
		...project.goals.map(goalLine),
		'Open tasks:',
		...project.tasks.map(taskLine)
	];
}

function goalLine(goal: RegisterGoal): string {
	return `- ${goal.title} — autocomplete ${autocompleteWord(goal.isAutocomplete)} (id: ${goal.id})`;
}

function taskLine(task: RegisterTask): string {
	const source = task.setting === null ? '' : ', set on the task';
	return `- ${task.title} — autocomplete ${autocompleteWord(task.isAutocomplete)}${source} (id: ${task.id})`;
}
