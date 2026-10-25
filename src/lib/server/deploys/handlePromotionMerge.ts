import type { SupabaseClient } from '@supabase/supabase-js';
import { bringStagedLive } from '$lib/server/mergeDeploys/bringStagedLive';
import { findProjectsByRepository } from './findProjectsByRepository';
import { isStagingBranch, stagingBranch } from '$lib/data/stagingBranch';
import type { Project } from '$lib/server/projects/projectRecord';
import { pullRequestChanges, type PullRequestEvent } from './readPullRequestEvent';

export type PromotionOutcome = { kind: 'promotion_recorded'; taskIds: string[] };

/**
 * The merge of staging into a project's default branch is the deploy, so it takes live every task whose work was
 * waiting on staging. Any other pull request is null here and is a task's own, handled as such.
 */
export async function handlePromotionMerge(
	supabase: SupabaseClient,
	pullRequest: PullRequestEvent
): Promise<PromotionOutcome | null> {
	if (pullRequest.change !== pullRequestChanges.merged) return null;
	if (pullRequest.branchName !== stagingBranch) return null;
	const projects = await findProjectsByRepository(supabase, pullRequest.repositoryUrl);
	const promoted = projects.filter((project) => isPromotion(pullRequest, project));
	if (promoted.length === 0) return null;
	const taskIds: string[] = [];
	for (const project of promoted) {
		const liveTaskIds = await bringStagedLive(supabase, project, pullRequest.url);
		taskIds.push(...liveTaskIds);
	}
	return { kind: 'promotion_recorded', taskIds };
}

function isPromotion(pullRequest: PullRequestEvent, project: Project): boolean {
	const isFromStaging = isStagingBranch(pullRequest.branchName, project.defaultBranch);
	return isFromStaging && pullRequest.baseBranch === project.defaultBranch;
}
