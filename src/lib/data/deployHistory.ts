import type { StagingDates } from './stagedTasks';

/** One promotion of staging: the moment it went live and every task it carried. */
export type Deploy<Task> = { liveAt: string; tasks: Task[] };

export const recentDeployCount = 10;

const oneTask = 1;

/**
 * The deploys that carried the tasks, newest first. A promotion marks every task it carries live at the same
 * moment, so the tasks sharing a live moment are the ones that went live together.
 */
export function deployHistoryOf<Task extends StagingDates>(tasks: Task[], deployCount = recentDeployCount): Deploy<Task>[] {
	const tasksByLiveAt = new Map<string, Task[]>();
	for (const task of tasks) {
		if (task.liveAt === null) continue;
		const carried = tasksByLiveAt.get(task.liveAt) ?? [];
		tasksByLiveAt.set(task.liveAt, [...carried, task]);
	}
	const deploys = [...tasksByLiveAt].map(([liveAt, carried]) => ({ liveAt, tasks: carried }));
	return deploys.sort(byLatestDeploy).slice(0, deployCount);
}

function byLatestDeploy<Task>(first: Deploy<Task>, second: Deploy<Task>): number {
	return Date.parse(second.liveAt) - Date.parse(first.liveAt);
}

/** How many tasks a deploy carried, as a phrase: "1 task", "3 tasks". */
export function carriedTaskPhrase<Task>(carriedTasks: Task[]): string {
	const taskCount = carriedTasks.length;
	if (taskCount === oneTask) return '1 task';
	return `${taskCount} tasks`;
}
