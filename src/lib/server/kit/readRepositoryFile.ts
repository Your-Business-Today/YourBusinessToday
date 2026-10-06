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
	const repositoryKey = repositoryUrlKey(repositoryUrl);
	if (!repositoryKey.startsWith(githubHostPrefix)) return { kind: 'unreadable' };
	const ownerAndName = repositoryKey.slice(githubHostPrefix.length);
	const repositoryAddress = `${githubRepositoriesApi}/${ownerAndName}`;
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

async function missingWhenRepositoryIsVisible(repositoryAddress: string): Promise<RepositoryFile> {
	const response = await fetch(repositoryAddress, { headers: githubHeaders() });
	return response.ok ? { kind: 'missing' } : { kind: 'unreadable' };
}

function githubHeaders(): Record<string, string> {
	const headers: Record<string, string> = {
		Accept: 'application/vnd.github.raw',
		'User-Agent': 'your-business-today'
	};
	if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
	return headers;
}
