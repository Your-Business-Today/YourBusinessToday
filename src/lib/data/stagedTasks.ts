import { formatBritishDateTime } from './britishDate';

/** When a task's work reached staging, and when a promotion carried it live. */
export type StagingDates = { stagedAt: string | null; liveAt: string | null };

export const notLiveYetLabel = 'merged into staging, not live yet';

export function isStagedNotLive(task: StagingDates): boolean {
	return task.stagedAt !== null && task.liveAt === null;
}

/** The tasks merged into staging and still waiting for a promotion, latest merge first. */
export function stagedTasksOf<Task extends StagingDates>(tasks: Task[]): Task[] {
	return tasks.filter(isStagedNotLive).sort(byLatestStaged);
}

function byLatestStaged(first: StagingDates, second: StagingDates): number {
	const firstStagedAt = first.stagedAt ?? '';
	const secondStagedAt = second.stagedAt ?? '';
	return secondStagedAt.localeCompare(firstStagedAt);
}

/** Where a task's merged work stands, or '' for a task whose work has not reached staging. */
export function describeStagingStanding(task: StagingDates): string {
	if (task.stagedAt === null) return '';
	if (task.liveAt === null) {
		return `Merged into staging on ${formatBritishDateTime(task.stagedAt)}; deploys when staging is next promoted.`;
	}
	return `Live since ${formatBritishDateTime(task.liveAt)}.`;
}
