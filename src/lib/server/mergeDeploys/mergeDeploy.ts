/** A task's merge into the default branch, live once its checks there have passed. */
export type MergeDeploy = {
	id: string;
	taskId: string;
	projectId: string;
	commitSha: string;
	pullRequestUrl: string;
	mergedAt: string;
	liveAt: string | null;
};

export const mergeDeployColumns = 'id, task_id, project_id, commit_sha, pull_request_url, merged_at, live_at';

export function parseMergeDeploy(row: Record<string, unknown>): MergeDeploy {
	return {
		id: row.id as string,
		taskId: row.task_id as string,
		projectId: row.project_id as string,
		commitSha: row.commit_sha as string,
		pullRequestUrl: row.pull_request_url as string,
		mergedAt: row.merged_at as string,
		liveAt: (row.live_at as string) ?? null
	};
}
