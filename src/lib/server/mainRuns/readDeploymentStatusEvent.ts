import { outcomeOf, type FinishedRun } from '$lib/data/mainRun';

export const productionDeployCheck = 'Production deploy';

const productionEnvironment = 'production';
const passingStates: ReadonlySet<string> = new Set(['success']);
const failingStates: ReadonlySet<string> = new Set(['failure', 'error']);

type DeploymentStatusEvent = {
	deployment_status?: { state?: string; log_url?: string; target_url?: string; updated_at?: string };
	deployment?: { id?: number; environment?: string };
	repository?: { html_url?: string };
};

/** A production deployment (Vercel's, say) that succeeded or failed, or null for any other deployment status. */
export function readDeploymentStatusEvent(event: unknown, receivedAt: Date): FinishedRun | null {
	const { deployment_status: status, deployment, repository } = event as DeploymentStatusEvent;
	const environment = (deployment?.environment ?? '').toLowerCase();
	if (environment !== productionEnvironment || deployment?.id === undefined) return null;
	const outcome = outcomeOf(status?.state ?? '', passingStates, failingStates);
	const repositoryUrl = repository?.html_url ?? '';
	if (outcome === null || repositoryUrl === '') return null;
	return {
		repositoryUrl,
		branch: '',
		isProductionDeploy: true,
		checkName: productionDeployCheck,
		runId: String(deployment.id),
		outcome,
		runUrl: status?.log_url || status?.target_url || '',
		finishedAt: status?.updated_at ?? receivedAt.toISOString()
	};
}
