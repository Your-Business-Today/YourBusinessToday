import { deleteProject } from '$lib/server/projects/deleteProject';
import { isProjectNamedBack, projectDeletionInputs, refusalToDeleteProject } from '$lib/data/projectDeletion';
import { noSuchProject } from './describeProject';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import { projectDeleted, projectStays, whatProjectHolds } from './describeProjectDeletion';
import { reachableProject } from '../projectAccess';
import { readProjectContents } from '$lib/server/projects/readProjectContents';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const { confirmProjectName } = projectDeletionInputs;

const projectNameField = textField(
	'The project’s name, given back once the person has seen what the project holds'
);

export const projectRemovalActions: McpAction[] = [
	{
		name: 'delete_project',
		area: 'projects',
		audience: 'everyone',
		isWrite: true,
		summary:
			'delete a project created by mistake, with everything in it: one that holds finished tasks is ' +
			'refused, and nothing goes until the project’s name is given back',
		guidance:
			'Finished work is never deleted: a project that holds finished tasks is the record of that work, ' +
			'and this refuses it. A project that has simply finished is set to complete with ' +
			'update_project_details instead. Deleting is for a project created by mistake, and only on the ' +
			'person’s word. Call it first with the project id alone: nothing is deleted, and the answer says ' +
			'what the project holds. It goes ahead only when confirmProjectName gives the project’s name ' +
			'back, after the person has seen that answer, and it takes every goal, task and subtask in the ' +
			'project with it, and their attached files. A copy of each deleted task is kept with its ' +
			'conversation and history, though not its attached files, and nothing here puts a project back.',
		inputSchema: objectSchema(
			{ projectId: textField('The project id'), [confirmProjectName]: projectNameField },
			['projectId']
		),
		run: async (caller, input) => deleteOnceNamedBack(caller, input)
	}
];

async function deleteOnceNamedBack(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const project = await reachableProject(caller, readText(input, 'projectId'));
	if (project === null) return noSuchProject;
	const contents = await readProjectContents(caller.supabase, project.id);
	const reasonToKeep = refusalToDeleteProject(project.name, contents);
	if (reasonToKeep !== null) return projectStays(reasonToKeep);
	const nameGiven = readOptionalText(input, confirmProjectName);
	const isNamedBack = isProjectNamedBack(project.name, nameGiven);
	if (!isNamedBack) return whatProjectHolds(project.name, contents, nameGiven);
	const refusal = await deleteProject(caller.supabase, project, caller.accountId);
	if (refusal !== null) return projectStays(refusal);
	return projectDeleted(project.name, contents);
}
