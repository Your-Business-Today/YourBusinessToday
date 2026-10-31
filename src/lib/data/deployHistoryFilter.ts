import { ukClockAt } from './ukClock';
import type { Deploy } from './deployHistory';
import type { StagingDates } from './stagedTasks';

/** A task as the deploy history searches it: its title and when it went live. */
export type DeployedTask = StagingDates & { title: string };

/** What a person narrows the deploy history to: words in a task's title, and the UK days between two dates. */
export type DeployFilter = { words: string; fromDate: string; toDate: string };

export const everyDeploy: DeployFilter = { words: '', fromDate: '', toDate: '' };

export const deploysPerPage = 20;

const noBound = '';

/** The deploys within the dates, each keeping only its tasks whose titles hold the words, and none left empty. */
export function filterDeploys<Task extends DeployedTask>(deploys: Deploy<Task>[], filter: DeployFilter): Deploy<Task>[] {
	const words = filter.words.trim().toLowerCase();
	const withinDates = deploys.filter((deploy) => isWithinDates(deploy.liveAt, filter));
	const narrowed = withinDates.map((deploy) => ({ ...deploy, tasks: deploy.tasks.filter((task) => titleHolds(task, words)) }));
	return narrowed.filter(({ tasks }) => tasks.length > 0);
}

function isWithinDates(liveAt: string, filter: DeployFilter): boolean {
	const ukDay = ukClockAt(new Date(liveAt)).date;
	const isAfterStart = filter.fromDate === noBound || ukDay >= filter.fromDate;
	const isBeforeEnd = filter.toDate === noBound || ukDay <= filter.toDate;
	return isAfterStart && isBeforeEnd;
}

function titleHolds(task: DeployedTask, words: string): boolean {
	return task.title.toLowerCase().includes(words);
}

export function deployPageCount<Task>(deploys: Deploy<Task>[]): number {
	return Math.max(1, Math.ceil(deploys.length / deploysPerPage));
}

export function deploysOnPage<Task>(deploys: Deploy<Task>[], pageNumber: number): Deploy<Task>[] {
	const firstIndex = (pageNumber - 1) * deploysPerPage;
	return deploys.slice(firstIndex, firstIndex + deploysPerPage);
}
