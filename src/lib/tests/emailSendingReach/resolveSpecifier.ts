import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

const libraryAlias = '$lib/';
const libraryFolder = 'src/lib/';
const relativeOpening = '.';
const candidateEndings = ['', '.ts', '/index.ts'];

/** The repository file an import names, or null for a package, a Svelte file or anything outside the source. */
export function resolveSpecifier(importingPath: string, specifier: string): string | null {
	const bare = bareRepositoryPath(importingPath, specifier);
	if (bare === null) return null;
	const withoutScriptEnding = bare.replace(/\.js$/, '');
	return candidateEndings.map((ending) => `${withoutScriptEnding}${ending}`).find(isTypeScriptFile) ?? null;
}

function bareRepositoryPath(importingPath: string, specifier: string): string | null {
	if (specifier.startsWith(libraryAlias)) return `${libraryFolder}${specifier.slice(libraryAlias.length)}`;
	if (!specifier.startsWith(relativeOpening)) return null;
	const importingFolder = dirname(importingPath);
	return join(importingFolder, specifier);
}

function isTypeScriptFile(path: string): boolean {
	return path.endsWith('.ts') && existsSync(path);
}
