import type { Project } from '$lib/server/projects/projectRecord';

type RunPlace = { isProductionDeploy: boolean; branch: string };

/** Whether a run is on the project's default branch: a production deploy always is. */
export function isOnDefaultBranch(run: RunPlace, project: Project): boolean {
	return run.isProductionDeploy || run.branch === project.defaultBranch;
}
