import { reachableTask } from '../projectAccess';
import { describeTask, noSuchTask } from './describeTask';
import { getGlobalTaskPage } from '$lib/server/projects/getGlobalTaskPage';
import { getAssignedTasks } from '$lib/server/projects/getAssignedTasks';
import { loadTaskWorkspace } from '$lib/server/projects/loadTaskWorkspace';
import { objectSchema, readText, textField } from '../actionTypes';
import { taskStatusLabels } from '$lib/data/taskStatus';
import type { GlobalTask, GlobalTaskPage } from '$lib/server/projects/getGlobalTaskPage';
import type { McpAction } from '../actionTypes';

const firstPageNumber = 1;

export const taskReadActions: McpAction[] = [
	{
		name: 'read_task_queue',
		area: 'tasks',
		audience: 'everyone',
		isWrite: false,
		summary:
			'your queue: the top level tasks across the projects you own, in the order they will be worked',
		guidance:
			'Work it from the top. Tasks asked for by the people using a live project come first, ' +
			'then the owner’s own work on live projects, then everything on projects that are ' +
			'scoping or on hold, which waits. A new task joins the end of its band; a task moved by ' +
			'hand stays where it is put.',
		inputSchema: objectSchema({
			pageNumber: { type: 'number', description: 'Which page of twenty, from 1' },
			shouldIncludeDone: { type: 'boolean', description: 'Include tasks already done' }
		}),
		run: async (caller, input) => {
			const taskPage = await getGlobalTaskPage(
				caller.supabase,
				caller.accountId,
				readPageNumber(input.pageNumber),
				input.shouldIncludeDone === true
			);
			if (taskPage.taskCount === 0) return 'Nothing is queued on the projects you own.';
			return describeQueue(taskPage);
		}
	},
	{
		name: 'read_team_tasks',
		area: 'tasks',
		audience: 'everyone',
		isWrite: false,
		summary: 'the open tasks assigned to you across every project you are on, soonest due first',
		inputSchema: objectSchema({}),
		run: async (caller) => {
			const tasks = await getAssignedTasks(caller.supabase, caller.accountId);
			if (tasks.length === 0) return 'Nothing open is assigned to you on any project.';
			return tasks.map((task, index) => queueLine(task, index + 1)).join('\n');
		}
	},
	{
		name: 'read_task',
		area: 'tasks',
		audience: 'everyone',
		isWrite: false,
		summary:
			'read one task in full with its story, team, criteria, checklists, attachments and comments',
		inputSchema: objectSchema({ taskId: textField('The task id') }, ['taskId']),
		run: async (caller, input) => {
			const task = await reachableTask(caller, readText(input, 'taskId'));
			if (task === null) return noSuchTask;
			const workspace = await loadTaskWorkspace(caller.supabase, task.projectId, task.id);
			if (workspace === null) return noSuchTask;
			return describeTask(workspace);
		}
	}
];

function describeQueue(taskPage: GlobalTaskPage): string {
	const place = `page ${taskPage.pageNumber} of ${taskPage.pageCount}`;
	const heading = `Your queue — ${place}, ${taskPage.taskCount} tasks. Numbers are queue positions (done tasks keep theirs, so they may skip); set_task_queue_priority takes them.`;
	const lines = taskPage.tasks.map((task, index) =>
		queueLine(task, task.globalPriority ?? taskPage.firstTaskNumber + index)
	);
	return [heading, ...lines].join('\n');
}

function queueLine(task: GlobalTask, position: number): string {
	const status = taskStatusLabels[task.status];
	const requested = task.requesterName === null ? '' : `, requested by ${task.requesterName}`;
	return `${position}. ${task.title} — ${status}, ${task.projectName}${requested} (id: ${task.id})`;
}

function readPageNumber(value: unknown): number {
	const pageNumber = Number(value);
	if (!Number.isInteger(pageNumber) || pageNumber < firstPageNumber) return firstPageNumber;
	return pageNumber;
}
