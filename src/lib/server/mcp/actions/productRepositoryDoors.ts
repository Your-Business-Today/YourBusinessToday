import { countOf } from '$lib/data/countOf';
import { listFolderInRepository, type FolderEntry } from '$lib/server/kit/listFolderInRepository';
import { openRepositoryDoor, unreadableRepository, type RepositoryDoor } from './productRepositoryDoor';
import { readRepositoryFile, repositoryFileKinds } from '$lib/server/kit/readRepositoryFile';
import { repositoryDoorLimits as limits } from '$lib/server/productRepository/repositoryDoorLimits';
import { repositoryDoorNames } from './siteMapRunActionNames';
import type { McpCaller } from '../resolveMcpCaller';

const folderMark = '/';

/** The entries of one folder of a product's repository, folders first marked with a /, at most a set number a call. */
export async function listFolderOfRepository(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const door = await openRepositoryDoor(caller, input, false);
	if (typeof door === 'string') return door;
	const { project, location, ref } = door;
	const entries = await listFolderInRepository(project.repositoryUrl, location.addressPath, ref);
	if (entries.length === 0) return nothingListed(door);
	const shown = entries.slice(0, limits.mostFolderEntries);
	const lines = shown.map(entryLine);
	const unshownCount = entries.length - shown.length;
	if (unshownCount > 0) lines.push(`- and ${unshownCount} more not shown: list the folders inside it instead.`);
	return [`${folderNameOf(door)} at ${door.readAt}, ${countOf(entries.length, 'item')}:`, ...lines].join('\n');
}

/** One file of a product's repository as text, cut at a set number of characters a call and saying so. */
export async function readFileOfRepository(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const door = await openRepositoryDoor(caller, input, true);
	if (typeof door === 'string') return door;
	const { project, location, ref, readAt } = door;
	const file = await readRepositoryFile(project.repositoryUrl, location.addressPath, ref);
	if (file.kind === repositoryFileKinds.unreadable) return unreadableRepository;
	if (file.kind === repositoryFileKinds.missing) return `No file ${location.path} in ${project.name}'s repository at ${readAt}: ${repositoryDoorNames.listFolder} shows what its folder holds.`;
	return fileAnswer(door, file.text);
}

function fileAnswer({ project, location, readAt }: RepositoryDoor, text: string): string {
	const heading = `${location.path} in ${project.name}'s repository at ${readAt}, ${countOf(text.length, 'character')}`;
	if (text.length <= limits.mostFileCharacters) return `${heading}:\n\n${text}`;
	const cut = `${heading}, so only the first ${limits.mostFileCharacters} are here: a file this long is rarely written by hand, so read the files it is built from instead.`;
	return `${cut}\n\n${text.slice(0, limits.mostFileCharacters)}`;
}

function entryLine(entry: FolderEntry): string {
	if (entry.isFolder) return `- ${entry.path}${folderMark}`;
	return `- ${entry.path}`;
}

function folderNameOf({ project, location }: RepositoryDoor): string {
	if (location.path === '') return `The root of ${project.name}'s repository`;
	return `${location.path}${folderMark} in ${project.name}'s repository`;
}

function nothingListed(door: RepositoryDoor): string {
	return (
		`Nothing listed for ${folderNameOf(door)} at ${door.readAt}: it is not a folder of the repository, or it is empty. ` +
		`When even the root lists nothing: ${unreadableRepository}`
	);
}
