import { reachableProject } from '../projectAccess';
import { createTask, type NewTaskSeed } from '$lib/server/projects/createTask';
import { newTaskRefusal } from '$lib/server/projects/newTaskRefusal';
import { noSuchProject } from './describeProject';
import { readOptionalText, readText } from '../actionTypes';
import { readConnectorTaskSeed } from './connectorTaskSeed';
import { autocompleteWord, isTaskAutocomplete } from '$lib/data/autocomplete';
import { withRaiserAutocomplete } from '$lib/data/autocompleteStanding';
import { readRequester } from './requestedByField';
import { similarTasksRefusal } from './similarTasksRefusal';
import { chooseTaskDepartment, isDepartmentRefused } from './departmentChoice';
import { isPersonLedTitle, personLedTitleRefusal } from '$lib/data/personLedTitle';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { isTitleRefused, validateDevelopmentKind } from './developmentKindField';
import { isDesignTextRefused, validateDesignText } from './designChangeField';
import { designRequestSentence, raiseDesignRequest } from './raiseDesignRequest';
import type { McpCaller } from '../resolveMcpCaller';
import type { Project } from '$lib/server/projects/projectRecord';

/** A task the connector raised: its id, and the sentence that tells the caller so. */
export type RaisedTask = { taskId: string; sentence: string };

/** What the caller is told of a raising: the sentence that it was raised, or why it was not. */
export function raisingAnswer(raised: RaisedTask | string): string {
	return typeof raised === 'string' ? raised : raised.sentence;
}

/** Raises a task from create_task's input, through every check create_task makes, or says why it cannot. */
export async function raiseTask(caller: McpCaller, input: Record<string, unknown>): Promise<RaisedTask | string> {
	const project = await reachableProject(caller, readText(input, 'projectId'));
	if (project === null) return noSuchProject;
	const seed = await checkedSeed(caller, project, input);
	if (typeof seed === 'string') return seed;
	const refusal = await newTaskRefusal(caller.supabase, project.id, seed);
	if (refusal !== null) return refusal;
	const similarRefusal = await similarTasksRefusal(caller, project, seed, input.raiseAnyway);
	if (similarRefusal !== null) return similarRefusal;
	const taskId = await createTask(caller.supabase, project.id, seed, caller.accountId);
	await raiseDesignRequest(caller, project, taskId, seed);
	const autocomplete = autocompleteWord(isTaskAutocomplete(seed.autocomplete ?? null, null));
	const raised = `"${seed.title}" added to ${project.name} with autocomplete ${autocomplete} (task id: ${taskId}).`;
	return { taskId, sentence: `${raised}${designRequestSentence(seed)}` };
}

async function checkedSeed(
	caller: McpCaller,
	project: Project,
	input: Record<string, unknown>
): Promise<NewTaskSeed | string> {
	const typedTitle = readOptionalText(input, 'title');
	if (typedTitle === null) return 'A task needs a title. Say what to call it and try again.';
	const people = await getPeopleOnProject(caller.supabase, project.id);
	if (isPersonLedTitle(typedTitle, people)) return personLedTitleRefusal;
	const requester = await readRequester(caller, project.id, input);
	if ('refusal' in requester) return requester.refusal;
	const department = await chooseTaskDepartment(caller, input);
	if (isDepartmentRefused(department)) return department.refusal;
	const titleChoice = validateDevelopmentKind(input, typedTitle, department);
	if (isTitleRefused(titleChoice)) return titleChoice.refusal;
	const designChange = validateDesignText(input, 'designChange');
	if (isDesignTextRefused(designChange)) return designChange.refusal;
	const raised = readConnectorTaskSeed(input, titleChoice.title, requester.accountId);
	const seed = { ...raised, department, designChange: designChange.text };
	return withRaiserAutocomplete(seed, caller.isStaff);
}
