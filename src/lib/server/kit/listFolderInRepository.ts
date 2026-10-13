import { githubHeaders, githubMediaTypes, githubRepositoryAddress } from './readRepositoryFile';

/** One entry of a folder in a repository: a file or a folder, by name and path. */
export type FolderEntry = { name: string; path: string; isFolder: boolean };

const folderEntryType = 'dir';

/** The entries of a folder at a branch or commit; a folder the repository does not have, or cannot be read, is empty. */
export async function listFolderInRepository(repositoryUrl: string, path: string, ref: string): Promise<FolderEntry[]> {
	const repositoryAddress = githubRepositoryAddress(repositoryUrl);
	if (repositoryAddress === null) return [];
	const folderAddress = `${repositoryAddress}/contents/${path}?ref=${encodeURIComponent(ref)}`;
	try {
		const response = await fetch(folderAddress, { headers: githubHeaders(githubMediaTypes.json) });
		if (!response.ok) return [];
		return entriesOf(await response.json());
	} catch {
		return [];
	}
}

function entriesOf(listing: unknown): FolderEntry[] {
	if (!Array.isArray(listing)) return [];
	return listing.map((entry) => ({
		name: String(entry?.name ?? ''),
		path: String(entry?.path ?? ''),
		isFolder: entry?.type === folderEntryType
	}));
}
