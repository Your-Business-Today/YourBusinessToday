import { githubGet } from './githubRequest';

type Comparison = { ahead_by: number };

/** How many commits the head branch holds that the base branch does not, as GitHub compares them. */
export async function countCommitsAhead(repositoryAddress: string, base: string, head: string): Promise<number> {
	const compareAddress = `${repositoryAddress}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`;
	const comparison = await githubGet<Comparison>(compareAddress);
	return comparison.ahead_by;
}
