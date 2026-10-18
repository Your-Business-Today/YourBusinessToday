import { titleWithoutExemptPrefix } from './userStoryRule';

export type SimilarTask = {
	taskId: string;
	projectId: string;
	title: string;
	raisedBy: string;
	sharedWords: string[];
};

export const raiseAnywayFieldName = 'raiseAnyway';
export const raiseAnywayFormValue = 'true';

export const similarTasksFoundMessage =
	'Open tasks on this project look like this one. If one already covers it, post on that task instead; otherwise raise it anyway.';

/** The texts a task is compared by: its title without a bug fix or refactor prefix, and what its story wants when it has one. */
export function comparedTaskTexts(title: string, want: string | null | undefined): string[] {
	const texts = [titleWithoutExemptPrefix(title)];
	const wanted = (want ?? '').trim();
	if (wanted === '') return texts;
	return [...texts, wanted];
}

/** The similar tasks a refused new-task form came back with, or none. */
export function readSimilarTasks(failureData: Record<string, unknown> | null): SimilarTask[] {
	const similarTasks = failureData?.similarTasks;
	if (!Array.isArray(similarTasks)) return [];
	return similarTasks as SimilarTask[];
}
