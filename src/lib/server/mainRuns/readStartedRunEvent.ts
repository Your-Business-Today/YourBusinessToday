import { commitShaOrNone } from '$lib/data/commitSha';
import { productionDeployCheck } from './readDeploymentStatusEvent';
import { workflowCheckName, type WorkflowRunEvent } from './readWorkflowRunEvent';

/** A check GitHub has started on a commit: a workflow run, or a production deployment, which has no branch. */
export type StartedRun = {
	repositoryUrl: string;
	branch: string;
	isProductionDeploy: boolean;
	checkName: string;
	commitSha: string;
};

const startingActions: ReadonlySet<string> = new Set(['requested', 'in_progress']);
const startingDeployStates: ReadonlySet<string> = new Set(['pending', 'queued', 'in_progress']);
const productionEnvironment = 'production';

type DeploymentStatusEvent = {
	deployment_status?: { state?: string };
	deployment?: { environment?: string; sha?: string };
	repository?: { html_url?: string };
};

/** A workflow run GitHub has asked for or begun, or null for anything else it says of a run. */
export function readStartedWorkflowRun(event: unknown): StartedRun | null {
	const { action, workflow_run: run, repository } = event as WorkflowRunEvent;
	const commitSha = commitShaOrNone(run?.head_sha);
	const repositoryUrl = repository?.html_url ?? '';
	if (!startingActions.has(action ?? '') || commitSha === '' || repositoryUrl === '') return null;
	const branch = run?.head_branch ?? '';
	return { repositoryUrl, branch, isProductionDeploy: false, checkName: workflowCheckName(event), commitSha };
}

/** A production deployment that has begun, or null for any other deployment status. */
export function readStartedDeployment(event: unknown): StartedRun | null {
	const { deployment_status: status, deployment, repository } = event as DeploymentStatusEvent;
	const isProduction = (deployment?.environment ?? '').toLowerCase() === productionEnvironment;
	const commitSha = commitShaOrNone(deployment?.sha);
	const repositoryUrl = repository?.html_url ?? '';
	const isStarting = startingDeployStates.has(status?.state ?? '');
	if (!isProduction || !isStarting || commitSha === '' || repositoryUrl === '') return null;
	return { repositoryUrl, branch: '', isProductionDeploy: true, checkName: productionDeployCheck, commitSha };
}
