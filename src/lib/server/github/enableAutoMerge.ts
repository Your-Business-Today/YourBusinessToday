import { githubGraphql } from './githubRequest';
import type { PullRequest } from './pullRequests';

const enableAutoMergeMutation = `
	mutation EnableAutoMerge($pullRequestId: ID!) {
		enablePullRequestAutoMerge(input: { pullRequestId: $pullRequestId, mergeMethod: MERGE }) {
			clientMutationId
		}
	}
`;

/** Asks GitHub to merge the pull request by itself, as a merge commit, once its checks pass. */
export async function enableAutoMerge(pullRequest: PullRequest): Promise<void> {
	await githubGraphql(enableAutoMergeMutation, { pullRequestId: pullRequest.nodeId });
}
