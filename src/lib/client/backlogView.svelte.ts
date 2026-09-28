import {
	countTasksWhere,
	onlyTasksWhere,
	withoutDoneTasks
} from '$lib/components/projects/taskTreeFilters';
import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

export type TaskPredicate = (task: TaskTreeNode) => boolean;

export type BacklogSources = {
	taskTree: () => TaskTreeNode[];
	assigneeIdsByTask: () => Record<string, string[]>;
	isWaitingOnMe: TaskPredicate;
};

/**
 * The backlog's filters — open or all, what is waiting on the viewer, one
 * person's tasks — and the tree they leave visible. The sources are read on
 * every question so the view follows the page's data as it reloads.
 */
export class BacklogView {
	shouldIncludeDone = $state(false);
	isWaitingOnMeOnly = $state(false);
	assigneeId = $state<string | null>(null);
	#sources: BacklogSources;

	constructor(sources: BacklogSources) {
		this.#sources = sources;
	}

	get waitingCount(): number {
		return countTasksWhere(this.#openTasks(), this.#sources.isWaitingOnMe);
	}

	get visibleTasks(): TaskTreeNode[] {
		return this.visibleTasksOf(this.#sources.taskTree());
	}

	assignedCountFor(personId: string): number {
		return countTasksWhere(this.#openTasks(), this.#isAssignedTo(personId));
	}

	toggleWaitingOnMe(): void {
		this.isWaitingOnMeOnly = !this.isWaitingOnMeOnly;
	}

	toggleAssignee(personId: string): void {
		this.assigneeId = this.assigneeId === personId ? null : personId;
	}

	visibleTasksOf(taskTree: TaskTreeNode[]): TaskTreeNode[] {
		const tasks = this.shouldIncludeDone ? taskTree : withoutDoneTasks(taskTree);
		if (!this.#isNarrowed) return tasks;
		return onlyTasksWhere(tasks, (task) => this.#isWanted(task));
	}

	get #isNarrowed(): boolean {
		return this.isWaitingOnMeOnly || this.assigneeId !== null;
	}

	#openTasks(): TaskTreeNode[] {
		return withoutDoneTasks(this.#sources.taskTree());
	}

	#isWanted(task: TaskTreeNode): boolean {
		const isWaitingWanted = !this.isWaitingOnMeOnly || this.#sources.isWaitingOnMe(task);
		const isAssigneeWanted = this.assigneeId === null || this.#isAssignedTo(this.assigneeId)(task);
		return isWaitingWanted && isAssigneeWanted;
	}

	#isAssignedTo(personId: string): TaskPredicate {
		const assigneeIdsByTask = this.#sources.assigneeIdsByTask();
		return (task) => (assigneeIdsByTask[task.id] ?? []).includes(personId);
	}
}
