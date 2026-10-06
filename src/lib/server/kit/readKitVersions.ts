import type { SupabaseClient } from '@supabase/supabase-js';
import {
	installedKitVersionPath,
	latestKitVersionPath,
	projectProcessDefaultBranch,
	projectProcessRepositoryUrl
} from './projectProcessKit';
import { readRepositoryFile, repositoryFileKinds } from './readRepositoryFile';
import { recordLatestKitVersion, recordProjectKitVersion } from './kitVersions';
import type { Project } from '$lib/server/projects/projectRecord';

export type KitVersionReading = { kind: 'read'; version: string } | { kind: 'unreadable' };

const noKitInstalled = '';

/** Reads VERSION from project-process and stores it as the latest kit; an unreadable file changes nothing. */
export async function readLatestKitVersion(
	supabase: SupabaseClient,
	ref: string = projectProcessDefaultBranch
): Promise<KitVersionReading> {
	const file = await readRepositoryFile(projectProcessRepositoryUrl, latestKitVersionPath, ref);
	if (file.kind !== repositoryFileKinds.found) return { kind: 'unreadable' };
	const version = file.text.trim();
	await recordLatestKitVersion(supabase, version);
	return { kind: 'read', version };
}

/** Reads the kit-version a project's repository carries and stores it; a repository without the kit reads as ''. */
export async function readKitVersionOfProject(
	supabase: SupabaseClient,
	project: Project,
	ref: string = project.defaultBranch
): Promise<KitVersionReading> {
	const file = await readRepositoryFile(project.repositoryUrl, installedKitVersionPath, ref);
	if (file.kind === repositoryFileKinds.unreadable) return { kind: 'unreadable' };
	const version = file.kind === repositoryFileKinds.found ? file.text.trim() : noKitInstalled;
	await recordProjectKitVersion(supabase, project.id, version);
	return { kind: 'read', version };
}
