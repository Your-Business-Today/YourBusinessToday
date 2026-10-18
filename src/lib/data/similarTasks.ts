export type SimilarTask = {
	taskId: string;
	projectId: string;
	title: string;
	raisedById: string;
	raisedBy: string;
	sharedWords: string[];
};

export const raiseAnywayFieldName = 'raiseAnyway';
export const raiseAnywayFormValue = 'true';

export const similarTasksFoundMessage =
	'Open tasks on this project look like this one. If one already covers it, post on that task instead; otherwise raise it anyway.';

/** The text a task is compared by: what its story wants, or its title when it has no story. */
export function comparedTaskText(title: string, want: string | null | undefined): string {
	const wanted = (want ?? '').trim();
	if (wanted === '') return title;
	return wanted;
}

/** The similar tasks a refused new-task form came back with, or none. */
export function readSimilarTasks(failureData: Record<string, unknown> | null): SimilarTask[] {
	const similarTasks = failureData?.similarTasks;
	if (!Array.isArray(similarTasks)) return [];
	return similarTasks as SimilarTask[];
}
