import { env } from '$env/dynamic/private';
import { repositoryUrlKey } from '$lib/server/deploys/repositoryUrlKey';

export type RepositoryFile =
	| { kind: 'found'; text: string }
	| { kind: 'missing' }
	| { kind: 'unreadable' };

export const repositoryFileKinds = { found: 'found', missing: 'missing', unreadable: 'unreadable' } as const;

const githubHostPrefix = 'github.com/';
const githubRepositoriesApi = 'https://api.github.com/repos';
const notFoundStatus = 404;

/**
 * One file of a GitHub repository at a branch or commit. A public repository needs no token;
 * a private one is read with GITHUB_TOKEN when it is set, and is unreadable without it. GitHub
 * answers 404 for a private repository it will not show, so a file is only missing when the
 * repository itself can be seen.
 */
export async function readRepositoryFile(
	repositoryUrl: string,
	path: string,
	ref: string
): Promise<RepositoryFile> {
	const repositoryAddress = githubRepositoryAddress(repositoryUrl);
	if (repositoryAddress === null) return { kind: 'unreadable' };
	const fileAddress = `${repositoryAddress}/contents/${path}?ref=${encodeURIComponent(ref)}`;
	try {
		const response = await fetch(fileAddress, { headers: githubHeaders() });
		if (response.status === notFoundStatus) return await missingWhenRepositoryIsVisible(repositoryAddress);
		if (!response.ok) return { kind: 'unreadable' };
		return { kind: 'found', text: await response.text() };
	} catch {
		return { kind: 'unreadable' };
	}
}

/** The GitHub API address of a repository, or null when the repository is not on GitHub. */
export function githubRepositoryAddress(repositoryUrl: string): string | null {
	const repositoryKey = repositoryUrlKey(repositoryUrl);
	if (!repositoryKey.startsWith(githubHostPrefix)) return null;
	const ownerAndName = repositoryKey.slice(githubHostPrefix.length);
	return `${githubRepositoriesApi}/${ownerAndName}`;
}

async function missingWhenRepositoryIsVisible(repositoryAddress: string): Promise<RepositoryFile> {
	const response = await fetch(repositoryAddress, { headers: githubHeaders() });
	return response.ok ? { kind: 'missing' } : { kind: 'unreadable' };
}

export const githubMediaTypes = { raw: 'application/vnd.github.raw', json: 'application/vnd.github+json' } as const;

export function githubHeaders(mediaType: string = githubMediaTypes.raw): Record<string, string> {
	const headers: Record<string, string> = {
		Accept: mediaType,
		'User-Agent': 'your-business-today'
	};
	if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
	return headers;
}
