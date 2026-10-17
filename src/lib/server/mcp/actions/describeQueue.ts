import { lifecycleMarkSuffix } from './describeLifecycle';
import { taskStatusLabels } from '$lib/data/taskStatus';
import { waitsForClause } from './describeSequence';
import type { GlobalTask, GlobalTaskPage } from '$lib/server/projects/getGlobalTaskPage';
import type { LifecycleMark } from '$lib/server/lifecycle/getLifecycleMarks';

export function describeQueue(taskPage: GlobalTaskPage, marksByTask: Map<string, LifecycleMark>): string {
	const place = `page ${taskPage.pageNumber} of ${taskPage.pageCount}`;
	const heading = `Your queue — ${place}, ${taskPage.taskCount} tasks. Numbers are queue positions (done tasks keep theirs, so they may skip); set_task_queue_priority takes them. Skip a task another AI holds.`;
	const lines = taskPage.tasks.map((task, index) =>
		queueLine(task, task.globalPriority ?? taskPage.firstTaskNumber + index, marksByTask.get(task.id))
	);
	return [heading, ...lines].join('\n');
}

export function queueLine(task: GlobalTask, position: number, mark?: LifecycleMark): string {
	const status = taskStatusLabels[task.status];
	const requested = task.requesterName === null ? '' : `, requested by ${task.requesterName}`;
	const waiting = waitsForClause(task);
	const lifecycle = lifecycleMarkSuffix(mark);
	return `${position}. ${task.title} — ${status}, ${task.projectName}${requested}${waiting}${lifecycle} (id: ${task.id})`;
}

export function queueProjectIds(taskPage: GlobalTaskPage): string[] {
	return [...new Set(taskPage.tasks.map((task) => task.projectId))];
}
