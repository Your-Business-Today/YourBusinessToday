import { reachableProject, reachableTask } from '../projectAccess';
import { createTask } from '$lib/server/projects/createTask';
import { fibonacciStoryPoints } from '$lib/data/storyPoints';
import { noSuchProject } from './describeProject';
import { noSuchTask } from './describeTask';
import { objectSchema, proseField, readOptionalText, readText, textField } from '../actionTypes';
import { parseTaskKind, taskKindOrder } from '$lib/data/taskKind';
import { readTaskDetailsEdit, wrongStoryPoints } from './taskDetailsEdit';
import { updateTaskDetails } from '$lib/server/projects/updateTaskDetails';
import type { McpAction } from '../actionTypes';

const taskIdField = textField('The task id');

const keepText = ' — leave out to keep what is there';

const storyPointsField = {
	type: 'number',
	description: `One of ${fibonacciStoryPoints.join(', ')}`
};

export const taskWriteActions: McpAction[] = [
	{
		name: 'create_task',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'add a task to a project, at the end of the backlog',
		guidance:
			'Search first: call find_tasks for the matter and work on the task you find. Raise one only ' +
			'when nothing matches — a bug titled "FIX: <what is wrong>", a feature by its user story. ' +
			'Tasks titled "REFACTOR: round N" are raised by the deploy count, never by hand.',
		inputSchema: objectSchema(
			{
				projectId: textField('The project the task belongs to'),
				title: textField('What the task is called'),
				details: proseField('What the task involves'),
				dueDate: textField('When it is due, as YYYY-MM-DD'),
				goalId: textField('The goal it serves, as given by find_goals'),
				parentTaskId: textField('The task it is a subtask of'),
				kind: textField(
					`${taskKindOrder.join(' or ')} — work unless somebody is waiting on an answer`
				)
			},
			['projectId', 'title']
		),
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noSuchProject;
			const title = readOptionalText(input, 'title');
			if (title === null) return 'A task needs a title. Say what to call it and try again.';
			const taskId = await createTask(
				caller.supabase,
				project.id,
				{
					title,
					details: readText(input, 'details'),
					dueDate: readOptionalText(input, 'dueDate'),
					parentTaskId: readOptionalText(input, 'parentTaskId'),
					goalId: readOptionalText(input, 'goalId'),
					kind: parseTaskKind(readText(input, 'kind'))
				},
				caller.accountId
			);
			return `"${title}" added to ${project.name} (task id: ${taskId}).`;
		}
	},
	{
		name: 'update_task_details',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'change a task title, details, due date, goal, kind, story points or percent done',
		guidance:
			`Story points are the Fibonacci run ${fibonacciStoryPoints.join(', ')}, with ` +
			'nothing in between. A support task carries the words the person who raised it used, ' +
			'so add to the details rather than rewriting them.',
		inputSchema: objectSchema(
			{
				taskId: taskIdField,
				title: textField(`A new title${keepText}`),
				details: proseField(`New details${keepText}`),
				dueDate: textField(`A new due date, as YYYY-MM-DD${keepText}`),
				goalId: textField(`The goal it serves${keepText}`),
				kind: textField(`${taskKindOrder.join(' or ')}${keepText}`),
				storyPoints: storyPointsField,
				completionPercent: { type: 'number', description: 'How far through it is, 0 to 100' }
			},
			['taskId']
		),
		run: async (caller, input) => {
			const task = await reachableTask(caller, readText(input, 'taskId'));
			if (task === null) return noSuchTask;
			const edit = readTaskDetailsEdit(input, task);
			if (edit === null) return wrongStoryPoints;
			await updateTaskDetails(caller.supabase, task.id, edit);
			return `"${edit.title}" saved — ${edit.storyPoints} points, ${edit.completionPercent}% done.`;
		}
	}
];
