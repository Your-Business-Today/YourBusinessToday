import { githubGet } from './githubRequest';
import type { PullRequest } from './pullRequests';
import { realClock, type Clock } from '$lib/server/watch/selfCheckKnock/waiting';

/** What GitHub says of merging a pull request: it can, it cannot because its two branches conflict, or it has not worked it out yet. */
export const mergeabilities = { mergeable: 'mergeable', conflicting: 'conflicting', notYetKnown: 'not_yet_known' } as const;

export type Mergeability = (typeof mergeabilities)[keyof typeof mergeabilities];

export type MergeabilityReader = () => Promise<Mergeability>;

type GithubPullRequest = { mergeable?: boolean | null };

const mostLooks = 5;
const millisecondsBetweenLooks = 2000;

/** Asks GitHub whether the pull request can be merged, looking again for a few seconds while GitHub is still working it out. */
export async function settledMergeability(repositoryAddress: string, pullRequest: PullRequest): Promise<Mergeability> {
	return lookUntilKnown(() => readMergeability(repositoryAddress, pullRequest), realClock);
}

/** Looks until GitHub has an answer or the looks run out, pausing between them, and gives the last thing GitHub said. */
export async function lookUntilKnown(read: MergeabilityReader, clock: Pick<Clock, 'pause'>): Promise<Mergeability> {
	let mergeability = await read();
	for (let looksMade = 1; looksMade < mostLooks && mergeability === mergeabilities.notYetKnown; looksMade += 1) {
		await clock.pause(millisecondsBetweenLooks);
		mergeability = await read();
	}
	return mergeability;
}

/** GitHub answers true, false, or null while its background job is still deciding. */
export function mergeabilityOf(canMerge: boolean | null | undefined): Mergeability {
	if (canMerge === true) return mergeabilities.mergeable;
	if (canMerge === false) return mergeabilities.conflicting;
	return mergeabilities.notYetKnown;
}

async function readMergeability(repositoryAddress: string, pullRequest: PullRequest): Promise<Mergeability> {
	const answer = await githubGet<GithubPullRequest>(`${repositoryAddress}/pulls/${pullRequest.number}`);
	return mergeabilityOf(answer.mergeable);
}
