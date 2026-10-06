import { getProject } from '$lib/server/projects/getProject';
import { supportTaskKind } from '$lib/data/taskKind';
import { longestMessageBody } from '$lib/server/conversations/postMessage';
import { noReachableProject, reachableTask } from '../projectAccess';
import { noReachableTask } from './describeSupportTask';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import { raiseSupportTask } from './raiseSupportTask';
import { resolveSupportTask } from '$lib/server/support/resolveSupportTask';
import { supportTaskIdField } from './supportTaskReadActions';
import type { McpAction } from '../actionTypes';

export const supportTaskWriteActions: McpAction[] = [
	{
		name: 'create_support_task',
		area: 'support',
		audience: 'everyone',
		isWrite: true,
		summary: 'raise something that needs an answer, under a goal or beneath an existing task',
		guidance:
			'Call find_goals and find_tasks first and show the person what matched; if an open task ' +
			'already covers it, post on its conversation instead. Ask before you create. One matter ' +
			'per task, in plain words, with why it matters — a person reads every one of these and ' +
			'the answer arrives in its conversation as a resolution.',
		inputSchema: objectSchema(
			{
				projectId: textField('The project id'),
				goalId: textField('The goal it serves, as given by find_goals'),
				parentTaskId: textField('The task it sits beneath, if it is about one'),
				title: textField('The matter in one sentence'),
				want: textField('What you want, in your own words'),
				benefit: textField('So that — why it matters')
			},
			['projectId', 'title', 'want']
		),
		run: async (caller, input) => raiseSupportTask(caller, input)
	},
	{
		name: 'resolve_support_task',
		area: 'support',
		audience: 'everyone',
		isWrite: true,
		summary: 'close a support task with the resolution the person who raised it will read',
		guidance:
			'The resolution is the answer, word for word, so write it to them: what was done or why ' +
			'not, and what they can do next. It is posted into the conversation and closes the task.',
		inputSchema: objectSchema(
			{ taskId: supportTaskIdField, resolution: textField('The answer, in words they will read') },
			['taskId', 'resolution']
		),
		run: async (caller, input) => {
			const task = await reachableTask(caller, readText(input, 'taskId'));
			if (task === null || task.kind !== supportTaskKind) return noReachableTask;
			const resolution = readOptionalText(input, 'resolution');
			if (resolution === null) return 'Give the resolution as well; it is what they read.';
			if (resolution.length > longestMessageBody)
				return `Keep it under ${longestMessageBody} characters.`;
			const project = await getProject(caller.supabase, task.projectId);
			if (project === null) return noReachableProject;
			await resolveSupportTask(caller.supabase, task, project, resolution, caller.accountId);
			return `"${task.title}" resolved, with your answer on it for whoever raised it to read.`;
		}
	}
];
