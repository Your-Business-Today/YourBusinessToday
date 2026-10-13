import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { handlePushEvent } from '$lib/server/deploys/handlePushEvent';
import { handleFinishedRun } from '$lib/server/mainRuns/handleFinishedRun';
import { handleTaskBranchPullRequest } from '$lib/server/deploys/handleTaskBranchPullRequest';
import { isGithubSignatureValid } from '$lib/server/deploys/verifyGithubSignature';
import { readGithubWebhookBody } from '$lib/server/deploys/readGithubWebhookBody';
import { readDeploymentStatusEvent } from '$lib/server/mainRuns/readDeploymentStatusEvent';
import { readPullRequestEvent } from '$lib/server/deploys/readPullRequestEvent';
import { readWorkflowRunEvent } from '$lib/server/mainRuns/readWorkflowRunEvent';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { FinishedRun } from '$lib/data/mainRun';
import type { RequestHandler } from './$types';

const githubEvents = {
	pullRequest: 'pull_request',
	push: 'push',
	workflowRun: 'workflow_run',
	deploymentStatus: 'deployment_status'
} as const;

type FinishedRunReader = (event: unknown, receivedAt: Date) => FinishedRun | null;

const finishedRunReaders = new Map<string, FinishedRunReader>([
	[githubEvents.workflowRun, readWorkflowRunEvent],
	[githubEvents.deploymentStatus, readDeploymentStatusEvent]
]);

/**
 * GitHub tells a task its branch's pull request opened or merged (pull_request), a project it deployed (push), and
 * how a workflow or production deployment on it ended (workflow_run, deployment_status).
 */
export const POST: RequestHandler = async ({ request }) => {
	if (!env.GITHUB_WEBHOOK_SECRET) error(503, 'github_webhook_not_configured');
	const payload = await request.text();
	const signature = request.headers.get('x-hub-signature-256');
	if (!isGithubSignatureValid(payload, signature, env.GITHUB_WEBHOOK_SECRET)) {
		error(400, 'invalid_signature');
	}
	const event = readGithubWebhookBody(request.headers.get('content-type'), payload);
	if (event === null) error(400, 'unreadable_payload');
	const eventName = request.headers.get('x-github-event');
	return json(await outcomeOf(eventName, event, request));
};

async function outcomeOf(
	eventName: string | null,
	event: unknown,
	request: Request
): Promise<Record<string, unknown>> {
	if (eventName === githubEvents.pullRequest) return changedPullRequest(event);
	if (eventName === githubEvents.push) return pushedDeploy(event, request);
	const readFinishedRun = finishedRunReaders.get(eventName ?? '');
	if (readFinishedRun !== undefined) return finishedRun(readFinishedRun, event);
	return { ignored: true };
}

async function changedPullRequest(event: unknown): Promise<Record<string, unknown>> {
	const pullRequest = readPullRequestEvent(event);
	if (pullRequest === null) return { ignored: true };
	return { outcome: await handleTaskBranchPullRequest(supabaseServiceClient(), pullRequest) };
}

async function pushedDeploy(event: unknown, request: Request): Promise<Record<string, unknown>> {
	const deliveryId = request.headers.get('x-github-delivery') ?? '';
	if (deliveryId === '') return { ignored: true };
	const outcome = await handlePushEvent(supabaseServiceClient(), event, deliveryId);
	return { outcome };
}

async function finishedRun(readFinishedRun: FinishedRunReader, event: unknown): Promise<Record<string, unknown>> {
	const run = readFinishedRun(event, new Date());
	return { outcome: await handleFinishedRun(supabaseServiceClient(), run) };
}
