import { outcomeOf, type FinishedRun } from '$lib/data/mainRun';

const completedAction = 'completed';
const unnamedWorkflow = 'Workflow';
const passingConclusions: ReadonlySet<string> = new Set(['success']);
const failingConclusions: ReadonlySet<string> = new Set(['failure', 'timed_out', 'startup_failure']);

type WorkflowRunEvent = {
	action?: string;
	workflow_run?: {
		id?: number;
		name?: string;
		head_branch?: string | null;
		conclusion?: string | null;
		html_url?: string;
		updated_at?: string;
	};
	workflow?: { name?: string };
	repository?: { html_url?: string };
};

/** A workflow run that finished passing or failing, or null for anything else GitHub says of a run. */
export function readWorkflowRunEvent(event: unknown, receivedAt: Date): FinishedRun | null {
	const { action, workflow_run: run, workflow, repository } = event as WorkflowRunEvent;
	if (action !== completedAction || run?.id === undefined) return null;
	const outcome = outcomeOf(run.conclusion ?? '', passingConclusions, failingConclusions);
	const repositoryUrl = repository?.html_url ?? '';
	if (outcome === null || repositoryUrl === '') return null;
	return {
		repositoryUrl,
		branch: run.head_branch ?? '',
		isProductionDeploy: false,
		checkName: workflow?.name ?? run.name ?? unnamedWorkflow,
		runId: String(run.id),
		outcome,
		runUrl: run.html_url ?? '',
		finishedAt: run.updated_at ?? receivedAt.toISOString()
	};
}
