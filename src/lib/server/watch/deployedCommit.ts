import { env } from '$env/dynamic/private';
import { deployedCommitHeader } from './deployedCommitHeader';

/** Names the commit Vercel built this deployment from, so a knock can tell which deploy answered it. */
export function deployedCommitHeaders(): Record<string, string> {
	const commit = env.VERCEL_GIT_COMMIT_SHA;
	if (!commit) return {};
	return { [deployedCommitHeader]: commit };
}
