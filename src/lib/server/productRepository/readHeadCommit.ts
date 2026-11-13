import { githubHeaders, githubMediaTypes, githubRepositoryAddress } from '$lib/server/kit/readRepositoryFile';

type CommitAnswer = { sha?: unknown };

/** The commit at the head of a branch of a GitHub repository; none when the repository cannot be read. */
export async function readHeadCommit(repositoryUrl: string, branch: string): Promise<string | null> {
	const repositoryAddress = githubRepositoryAddress(repositoryUrl);
	if (repositoryAddress === null) return null;
	const branchAddress = `${repositoryAddress}/commits/${encodeURIComponent(branch)}`;
	try {
		const response = await fetch(branchAddress, { headers: githubHeaders(githubMediaTypes.json) });
		if (!response.ok) return null;
		const answer = (await response.json()) as CommitAnswer;
		return typeof answer.sha === 'string' ? answer.sha : null;
	} catch {
		return null;
	}
}
