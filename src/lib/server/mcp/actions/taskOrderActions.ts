import { reachableTask } from '../projectAccess';
import { moveTask } from '$lib/server/projects/moveTask';
import { noSuchTask } from './describeTask';
import { objectSchema, readText, textField } from '../actionTypes';
import { placeTaskAction } from './placeTaskAction';
import { setTaskPriority } from '$lib/server/projects/setTaskPriority';
import {
	directionField,
	priorityField,
	readMoveDirection,
	readPriority,
	sayWhichDirection,
	sayWhichPriority
} from './orderingFields';
import type { McpAction } from '../actionTypes';

const taskIdField = textField('The task id');

export const taskOrderActions: McpAction[] = [
	{
		name: 'set_task_priority',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary:
			'give a task a priority number among the tasks beside it — the others shift to make room',
		guidance:
			'Priority is the order among siblings: a top level task among the project’s top ' +
			'level tasks, a subtask among the subtasks of its parent. 1 is worked first. ' +
			'read_project and read_task show each task’s number. For the order across every ' +
			'project, use set_task_queue_priority.',
		inputSchema: objectSchema({ taskId: taskIdField, priority: priorityField('task') }, [
			'taskId',
			'priority'
		]),
		run: async (caller, input) => {
			const task = await reachableTask(caller, readText(input, 'taskId'));
			if (task === null) return noSuchTask;
			const priority = readPriority(input);
			if (priority === null) return sayWhichPriority;
			await setTaskPriority(caller.supabase, task.id, priority);
			return `"${task.title}" is now priority ${priority} among the tasks beside it.`;
		}
	},
	{
		name: 'move_task',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'move a task one place up or down among the tasks beside it',
		guidance: 'To give it a particular number in one call, use set_task_priority.',
		inputSchema: objectSchema({ taskId: taskIdField, direction: directionField }, [
			'taskId',
			'direction'
		]),
		run: async (caller, input) => {
			const task = await reachableTask(caller, readText(input, 'taskId'));
			if (task === null) return noSuchTask;
			const direction = readMoveDirection(input);
			if (direction === null) return sayWhichDirection;
			await moveTask(caller.supabase, task.id, direction);
			return `"${task.title}" moved ${direction}.`;
		}
	},
	placeTaskAction
];
