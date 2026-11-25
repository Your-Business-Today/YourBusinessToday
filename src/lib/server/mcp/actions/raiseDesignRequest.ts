import { designReviewStageName } from '$lib/data/designReview';
import { askForDesignApproval } from '$lib/server/designReviews/askForDesignApproval';
import type { McpCaller } from '../resolveMcpCaller';
import type { NewTaskSeed } from '$lib/server/projects/createTask';
import type { Project } from '$lib/server/projects/projectRecord';

/** A task raised with a design change asks YBT for its approval on the task's own conversation. */
export async function raiseDesignRequest(
	caller: McpCaller,
	project: Project,
	taskId: string,
	seed: NewTaskSeed
): Promise<void> {
	if (seed.designChange === undefined) return;
	const request = { taskId, raisedBy: caller.accountId, change: seed.designChange };
	await askForDesignApproval(caller.supabase, project, request);
}

/** What the person is told of a request that changes the design: where it waits, and that nothing builds it yet. */
export function designRequestSentence(seed: NewTaskSeed): string {
	if (seed.designChange === undefined) return '';
	return (
		` It changes the design, so it waits as ${designReviewStageName}: nothing builds it until YBT ` +
		'approves it, and YBT’s answer comes back on the task.'
	);
}
