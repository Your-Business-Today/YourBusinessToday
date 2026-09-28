import { fibonacciStoryPoints } from '$lib/data/storyPoints';
import { noSuchTask } from './describeTask';
import { objectSchema, proseField, readText, textField } from '../actionTypes';
import { reachableTask } from '../projectAccess';
import { readTaskDetailsEdit, wrongStoryPoints } from './taskDetailsEdit';
import { taskKindOrder } from '$lib/data/taskKind';
import { updateTaskDetails } from '$lib/server/projects/updateTaskDetails';
import type { McpAction } from '../actionTypes';

const taskIdField = textField('The task id');

const keepText = ' — leave out to keep what is there';

const storyPointsField = {
	type: 'number',
	description: `One of ${fibonacciStoryPoints.join(', ')}`
};

export const taskUpdateActions: McpAction[] = [
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
