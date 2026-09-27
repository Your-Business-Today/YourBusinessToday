import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { handlePushEvent } from '$lib/server/deploys/handlePushEvent';
import { handleTaskBranchPullRequest } from '$lib/server/deploys/handleTaskBranchPullRequest';
import { isGithubSignatureValid } from '$lib/server/builder/verifyGithubSignature';
import { markBuildLive, type LiveOutcome } from '$lib/server/builder/markBuildLive';
import { readMergedPullRequest } from '$lib/server/builder/readMergedPullRequest';
import { readPullRequestEvent } from '$lib/server/deploys/readPullRequestEvent';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { RequestHandler } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';

/** GitHub tells a task its branch's pull request opened or merged (pull_request) and a project it deployed (push). */
export const POST: RequestHandler = async ({ request }) => {
	if (!env.GITHUB_WEBHOOK_SECRET) error(503, 'github_webhook_not_configured');
	const payload = await request.text();
	const signature = request.headers.get('x-hub-signature-256');
	if (!isGithubSignatureValid(payload, signature, env.GITHUB_WEBHOOK_SECRET)) {
		error(400, 'invalid_signature');
	}
	const eventName = request.headers.get('x-github-event');
	if (eventName === 'pull_request') return json(await changedPullRequest(JSON.parse(payload)));
	if (eventName === 'push') return json(await pushedDeploy(JSON.parse(payload), request));
	return json({ ignored: true });
};

async function changedPullRequest(event: unknown): Promise<Record<string, unknown>> {
	const supabase = supabaseServiceClient();
	const buildOutcome = await markMergedBuildLive(supabase, event);
	if (buildOutcome !== 'not_a_build') return { outcome: buildOutcome };
	const pullRequest = readPullRequestEvent(event);
	if (pullRequest === null) return { ignored: true };
	return { outcome: await handleTaskBranchPullRequest(supabase, pullRequest) };
}

async function markMergedBuildLive(supabase: SupabaseClient, event: unknown): Promise<LiveOutcome> {
	const merged = readMergedPullRequest(event);
	if (merged === null) return 'not_a_build';
	return markBuildLive(supabase, merged.branchName, merged.url);
}

async function pushedDeploy(event: unknown, request: Request): Promise<Record<string, unknown>> {
	const deliveryId = request.headers.get('x-github-delivery') ?? '';
	if (deliveryId === '') return { ignored: true };
	const outcome = await handlePushEvent(supabaseServiceClient(), event, deliveryId);
	return { outcome };
}
