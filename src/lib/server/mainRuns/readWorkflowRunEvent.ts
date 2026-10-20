import { commitShaOrNone } from '$lib/data/commitSha';
import { outcomeOf, type FinishedRun } from '$lib/data/mainRun';

const completedAction = 'completed';
const unnamedWorkflow = 'Workflow';
const passingConclusions: ReadonlySet<string> = new Set(['success']);
const failingConclusions: ReadonlySet<string> = new Set(['failure', 'timed_out', 'startup_failure']);

export type WorkflowRunEvent = {
	action?: string;
	workflow_run?: {
		id?: number;
		name?: string;
		head_branch?: string | null;
		head_sha?: string;
		conclusion?: string | null;
		html_url?: string;
		updated_at?: string;
	};
	workflow?: { name?: string };
	repository?: { html_url?: string };
};

/** A workflow run that finished passing or failing, or null for anything else GitHub says of a run. */
export function readWorkflowRunEvent(event: unknown, receivedAt: Date): FinishedRun | null {
	const { action, workflow_run: run, repository } = event as WorkflowRunEvent;
	if (action !== completedAction || run?.id === undefined) return null;
	const outcome = outcomeOf(run.conclusion ?? '', passingConclusions, failingConclusions);
	const repositoryUrl = repository?.html_url ?? '';
	if (outcome === null || repositoryUrl === '') return null;
	return {
		repositoryUrl,
		branch: run.head_branch ?? '',
		isProductionDeploy: false,
		checkName: workflowCheckName(event),
		runId: String(run.id),
		commitSha: commitShaOrNone(run.head_sha),
		outcome,
		runUrl: run.html_url ?? '',
		finishedAt: run.updated_at ?? receivedAt.toISOString()
	};
}

/** The workflow's own name, not the title its commit gave the run. */
export function workflowCheckName(event: unknown): string {
	const { workflow_run: run, workflow } = event as WorkflowRunEvent;
	return workflow?.name ?? run?.name ?? unnamedWorkflow;
}
