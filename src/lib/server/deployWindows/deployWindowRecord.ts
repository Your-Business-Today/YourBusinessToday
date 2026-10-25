import type { DeployWindow, DeployWindowOutcome, DeployWindowStart } from '$lib/data/deployWindow';

export const deployWindowColumns = 'project_id, window_date, ran_at, started_by, outcome, pull_request_url, note';

export function parseDeployWindow(row: Record<string, unknown>): DeployWindow {
	return {
		projectId: row.project_id as string,
		windowDate: row.window_date as string,
		ranAt: row.ran_at as string,
		startedBy: row.started_by as DeployWindowStart,
		outcome: row.outcome as DeployWindowOutcome,
		pullRequestUrl: (row.pull_request_url as string) ?? '',
		note: (row.note as string) ?? ''
	};
}
