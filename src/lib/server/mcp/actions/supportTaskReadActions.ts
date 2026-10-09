import { conversationAccountIds } from '$lib/server/conversations/conversationAccountIds';
import {
	describeOpenSupportTasks,
	describeTaskConversation,
	noReachableTask
} from './describeSupportTask';
import { findTasks } from '$lib/server/support/findTasks';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { getOpenSupportTasks } from '$lib/server/support/getOpenSupportTasks';
import { getProject } from '$lib/server/projects/getProject';
import { getThread } from '$lib/server/conversations/getThread';
import { noReachableProject, ownsProject, reachableProject, reachableTask } from '../projectAccess';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import { taskLine } from './describeGoal';
import { withProjectAccess } from './withProjectAccess';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

export const supportTaskIdField = textField('The task id, as given by find_tasks or read_goal');

export const supportTaskReadActions: McpAction[] = [
	{
		name: 'find_tasks',
		area: 'support',
		audience: 'everyone',
		isWrite: false,
		summary: 'search a project, or one goal on it, for the task something relates to',
		guidance:
			'Search before you create, and search the goal first. An open task that already covers ' +
			'the matter is where the conversation belongs — post on it rather than raising it again.',
		inputSchema: objectSchema(
			{
				projectId: textField('The project id'),
				goalId: textField('Narrow to the tasks under one goal'),
				words: textField('A few words from the task you have in mind — leave out to list them all')
			},
			['projectId']
		),
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noReachableProject;
			const tasks = await findTasks(caller.supabase, {
				projectId: project.id,
				goalId: readOptionalText(input, 'goalId'),
				phrase: readText(input, 'words')
			});
			if (tasks.length === 0)
				return `No task on ${project.name} matches. Widen the words, or offer to raise one.`;
			return tasks.map(taskLine).join('\n');
		}
	},
	{
		name: 'read_task_conversation',
		area: 'support',
		audience: 'everyone',
		isWrite: false,
		summary:
			'one task as the people on it see it: the ask, where it stands, its resolution, and every message',
		inputSchema: objectSchema({ taskId: supportTaskIdField }, ['taskId']),
		run: async (caller, input) => {
			const task = await reachableTask(caller, readText(input, 'taskId'));
			return withProjectAccess(caller, task, noReachableTask, (reachableTask) =>
				readConversation(caller, reachableTask)
			);
		}
	},
	{
		name: 'list_open_support_tasks',
		area: 'support',
		audience: 'everyone',
		isWrite: false,
		summary:
			'every support task still waiting on an answer across the projects you own, newest first',
		inputSchema: objectSchema({}),
		run: async (caller) =>
			describeOpenSupportTasks(await getOpenSupportTasks(caller.supabase, caller.accountId))
	}
];

async function readConversation(caller: McpCaller, task: ProjectTask): Promise<string> {
	const project = await getProject(caller.supabase, task.projectId);
	const messages = await getThread(
		caller.supabase,
		{ taskId: task.id },
		ownsProject(caller, task.projectId)
	);
	const authorIds = [task.createdBy, ...conversationAccountIds(messages)];
	const accounts = await getAccountsById(caller.supabase, authorIds);
	return describeTaskConversation(task, project?.name ?? '', messages, accounts);
}
