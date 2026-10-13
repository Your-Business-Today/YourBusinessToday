import type { SupabaseClient } from '@supabase/supabase-js';
import { blueprintSources } from '$lib/data/blueprint/blueprintSources';
import { blueprintOf } from './blueprintOf';
import { readRepositoryFile, repositoryFileKinds, type RepositoryFile } from '$lib/server/kit/readRepositoryFile';
import { saveProjectBlueprint } from './saveProjectBlueprint';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectBlueprint } from '$lib/data/blueprint/projectBlueprint';

export const blueprintReadingKinds = {
	read: 'read',
	noRepository: 'no_repository',
	unreadable: 'unreadable',
	nothingFound: 'nothing_found'
} as const;

export type BlueprintReading =
	| { kind: typeof blueprintReadingKinds.read; blueprint: ProjectBlueprint }
	| { kind: Exclude<(typeof blueprintReadingKinds)[keyof typeof blueprintReadingKinds], 'read'> };

/** Reads the domain and the site map the repository carries at a commit or branch, and keeps what it found. */
export async function readProjectBlueprint(
	supabase: SupabaseClient,
	project: Project,
	ref: string = project.defaultBranch
): Promise<BlueprintReading> {
	if (project.repositoryUrl === '') return { kind: blueprintReadingKinds.noRepository };
	const manifestFile = await readRepositoryFile(project.repositoryUrl, blueprintSources.entityManifestPath, ref);
	const siteFile = await readRepositoryFile(project.repositoryUrl, blueprintSources.siteDefinitionPath, ref);
	if (isUnreadable(manifestFile) || isUnreadable(siteFile)) return { kind: blueprintReadingKinds.unreadable };
	const blueprint = blueprintOf(textOf(manifestFile), textOf(siteFile), ref);
	if (blueprint.domain === null && blueprint.siteMap === null) return { kind: blueprintReadingKinds.nothingFound };
	await saveProjectBlueprint(supabase, project.id, blueprint);
	return { kind: blueprintReadingKinds.read, blueprint };
}

function isUnreadable(file: RepositoryFile): boolean {
	return file.kind === repositoryFileKinds.unreadable;
}

function textOf(file: RepositoryFile): string {
	return file.kind === repositoryFileKinds.found ? file.text : '';
}
