import { commitShape } from '$lib/data/journeyMap/journeyMapLimits';
import { repositoryDoorLimits as limits } from './repositoryDoorLimits';
import type { Refusal } from '$lib/server/portal/portalFormReading';

/** A path inside a repository, as the person's Claude wrote it and as GitHub's address for it is written. */
export type RepositoryPath = { path: string; addressPath: string };

const folderSeparator = '/';
const backslash = '\\';
const climbingParts = new Set(['.', '..']);
const repositoryRoot: RepositoryPath = { path: '', addressPath: '' };

/**
 * A path from the root of the repository, folder by folder, refused when it would climb out of it: a part that is
 * . or .., a leading /, a backslash or an empty part. Each part is written into GitHub's address as text, so no
 * part can be read as a step up.
 */
export function validateRepositoryPath(value: unknown, isRequired: boolean): RepositoryPath | Refusal {
	if (value !== undefined && value !== null && typeof value !== 'string') return { refusal: 'path must be text.' };
	const path = (value ?? '').trim();
	if (path === '') return isRequired ? { refusal: 'path is missing: give the file from the root, such as README.md.' } : repositoryRoot;
	if (path.length > limits.pathLength) return { refusal: `path is too long: keep it to ${limits.pathLength} characters.` };
	return pathFromRoot(path);
}

function pathFromRoot(path: string): RepositoryPath | Refusal {
	if (path.includes(backslash)) return { refusal: 'path holds a backslash: write folders with /, such as src/routes.' };
	const parts = path.split(folderSeparator);
	const hasEmptyPart = parts.some((part) => part === '');
	if (hasEmptyPart) return { refusal: 'path has an empty part: write it from the root, such as src/routes, with no leading, trailing or doubled /.' };
	const climbs = parts.some((part) => climbingParts.has(part));
	if (climbs) return { refusal: 'path holds . or ..: give it from the root of the repository, which is as far up as these doors read.' };
	return { path, addressPath: parts.map(encodeURIComponent).join(folderSeparator) };
}

/** The commit to read at: one the person's Claude names, or none for the head of the default branch. */
export function validateRepositoryCommit(value: unknown): string | null | Refusal {
	if (value === undefined || value === null || value === '') return null;
	const isCommit = typeof value === 'string' && commitShape.test(value);
	if (isCommit) return value;
	return { refusal: 'commit must be 7 to 40 lower-case hexadecimal characters: leave it out for the head of the default branch.' };
}
