import {
	countTasksWhere,
	onlyTasksWhere,
	withoutDoneTasks
} from '$lib/components/projects/taskTreeFilters';
import { countTasksInTree } from '$lib/components/projects/taskTreeCounts';
import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

export type TaskPredicate = (task: TaskTreeNode) => boolean;

export type BacklogSources = {
	taskTree: () => TaskTreeNode[];
	nextActionIdsByTask: () => Record<string, string[]>;
	isWaitingOnMe: TaskPredicate;
};

/**
 * The backlog's filters — open or all, what is waiting on the viewer, the
 * tasks whose next move is one person's — and the tree they leave visible. The sources are read on
 * every question so the view follows the page's data as it reloads.
 */
export class BacklogView {
	shouldIncludeDone = $state(false);
	isWaitingOnMeOnly = $state(false);
	personId = $state<string | null>(null);
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

	/**
	 * How many of the shown tasks the filters asked for. A parent shown only to
	 * hold a matching subtask is not counted, so the count agrees with the chip.
	 */
	countOf(visibleTasks: TaskTreeNode[]): number {
		if (!this.#isNarrowed) return countTasksInTree(visibleTasks);
		return countTasksWhere(visibleTasks, (task) => this.#isWanted(task));
	}

	countAcross(taskLists: TaskTreeNode[][]): number {
		return taskLists.reduce((count, tasks) => count + this.countOf(tasks), 0);
	}

	moveCountFor(personId: string): number {
		return countTasksWhere(this.#openTasks(), this.#isMoveOf(personId));
	}

	toggleWaitingOnMe(): void {
		this.isWaitingOnMeOnly = !this.isWaitingOnMeOnly;
	}

	togglePerson(personId: string): void {
		this.personId = this.personId === personId ? null : personId;
	}

	/** What the waiting and person filters leave, done or not: a status board's Done column and a calendar show both. */
	get visibleTasksDoneOrNot(): TaskTreeNode[] {
		return this.#narrowed(this.#sources.taskTree());
	}

	visibleTasksOf(taskTree: TaskTreeNode[]): TaskTreeNode[] {
		return this.#narrowed(this.shouldIncludeDone ? taskTree : withoutDoneTasks(taskTree));
	}

	#narrowed(tasks: TaskTreeNode[]): TaskTreeNode[] {
		if (!this.#isNarrowed) return tasks;
		return onlyTasksWhere(tasks, (task) => this.#isWanted(task));
	}

	get #isNarrowed(): boolean {
		return this.isWaitingOnMeOnly || this.personId !== null;
	}

	#openTasks(): TaskTreeNode[] {
		return withoutDoneTasks(this.#sources.taskTree());
	}

	#isWanted(task: TaskTreeNode): boolean {
		const isWaitingWanted = !this.isWaitingOnMeOnly || this.#sources.isWaitingOnMe(task);
		const isPersonWanted = this.personId === null || this.#isMoveOf(this.personId)(task);
		return isWaitingWanted && isPersonWanted;
	}

	#isMoveOf(personId: string): TaskPredicate {
		const nextActionIdsByTask = this.#sources.nextActionIdsByTask();
		return (task) => (nextActionIdsByTask[task.id] ?? []).includes(personId);
	}
}
