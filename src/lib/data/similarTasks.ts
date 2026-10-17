export type SimilarTask = {
	taskId: string;
	projectId: string;
	title: string;
	projectName: string;
	raisedById: string;
	raisedBy: string;
	sharedWords: string[];
};

export const raiseAnywayFieldName = 'raiseAnyway';
export const raiseAnywayFormValue = 'true';

export const similarTasksFoundMessage =
	'Open tasks across YBT look like this one. If one already covers it, post on that task instead; otherwise raise it anyway.';

/** The similar tasks a refused new-task form came back with, or none. */
export function readSimilarTasks(failureData: Record<string, unknown> | null): SimilarTask[] {
	const similarTasks = failureData?.similarTasks;
	if (!Array.isArray(similarTasks)) return [];
	return similarTasks as SimilarTask[];
}
