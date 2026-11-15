import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { accountNameLookup } from '$lib/data/accountNames';
import { findParentTitles } from '$lib/server/projects/taskDeletionSurroundings';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import {
	readableDeletion,
	readableDeletionsOfProject,
	readableDeletionsOfDeletedProjects
} from '../taskDeletionAccess';
import { describeTaskDeletionInFull, describeTaskDeletionList, type DeletionNames } from './describeTaskDeletions';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { TaskDeletion } from '$lib/server/projects/taskDeletionReading';

export const noSuchProjectWithDeletions =
	'No project you are on has that id, and you deleted no task from a project of that id that has since been deleted. ' +
	'Call list_projects for the ones you are on, or list_task_deletions with no projectId for the projects you deleted whole.';

export const noSuchTaskDeletion =
	'No deletion you can read has that id. list_task_deletions lists the tasks deleted from a project, with their ids.';

const whatWentAndWho =
	'Every task deleted from a project is kept on the record of deletions: the task as it was, with its conversation ' +
	'and history, who deleted it and when. The newest comes first. Use it to answer what happened to a task the ' +
	'person cannot find; read_task_deletion gives the whole copy of one. Leave out projectId for the tasks you ' +
	'deleted with a project deleted whole, which no project is left to list.';

const readTheCopy =
	'The copy is the task’s row as the board held it, with its conversation, lifecycle, feed, merges, criteria, ' +
	'checklists, assignees and roles. Its attached files are named but not kept: they went from storage with the ' +
	'task. The record itself is never changed or deleted.';

export const taskDeletionActions: McpAction[] = [
	{
		name: 'list_task_deletions',
		area: 'tasks',
		audience: 'everyone',
		isWrite: false,
		summary:
			'list the tasks deleted from a project, newest first, with where each stood, what it was under, who deleted it and when',
		guidance: whatWentAndWho,
		inputSchema: objectSchema(
			{
				projectId: textField('The project, as list_projects gives it; leave out for projects you deleted whole')
			},
			[]
		),
		run: async (caller, input) => {
			const projectId = readOptionalText(input, 'projectId');
			const readable =
				projectId === null
					? await readableDeletionsOfDeletedProjects(caller)
					: await readableDeletionsOfProject(caller, projectId);
			if (readable === null) return noSuchProjectWithDeletions;
			const names = await namesFor(caller, readable.deletions);
			return describeTaskDeletionList(readable.whereFrom, readable.deletions, names);
		}
	},
	{
		name: 'read_task_deletion',
		area: 'tasks',
		audience: 'everyone',
		isWrite: false,
		summary:
			'read one deleted task in full: the task as it was, with its conversation and history, who deleted it and when',
		guidance: readTheCopy,
		inputSchema: objectSchema(
			{
				deletionId: textField('The deletion, as list_task_deletions gives it')
			},
			['deletionId']
		),
		run: async (caller, input) => {
			const deletion = await readableDeletion(caller, readText(input, 'deletionId'));
			if (deletion === null) return noSuchTaskDeletion;
			return describeTaskDeletionInFull(deletion, await namesFor(caller, [deletion]));
		}
	}
];

async function namesFor(caller: McpCaller, deletions: TaskDeletion[]): Promise<DeletionNames> {
	const deleterIds = deletions.map((deletion) => deletion.deletedByAccountId).filter((accountId) => accountId !== null);
	const people = await getAccountsById(caller.supabase, deleterIds);
	const parentTitles = await findParentTitles(caller.supabase, deletions);
	return { nameOf: accountNameLookup(people), parentTitles };
}
