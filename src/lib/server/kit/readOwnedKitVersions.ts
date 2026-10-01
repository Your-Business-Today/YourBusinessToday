import type { SupabaseClient } from '@supabase/supabase-js';
import { getOwnedProjectsWithRepositories } from './getKitVersionRegister';
import { readLatestKitVersion, readKitVersionOfProject } from './readKitVersions';

export type KitVersionsRead = { latestIsRead: boolean; projectsRead: number; projectsUnreadable: number };

/** Reads the latest kit version and the version on every repository an owner has, there and then. */
export async function readOwnedKitVersions(
	serviceSupabase: SupabaseClient,
	ownerId: string
): Promise<KitVersionsRead> {
	const latest = await readLatestKitVersion(serviceSupabase);
	const { withRepository } = await getOwnedProjectsWithRepositories(serviceSupabase, ownerId);
	const readings = await Promise.all(
		withRepository.map((project) => readKitVersionOfProject(serviceSupabase, project))
	);
	const projectsUnreadable = readings.filter((reading) => reading.kind === 'unreadable').length;
	return {
		latestIsRead: latest.kind === 'read',
		projectsRead: readings.length - projectsUnreadable,
		projectsUnreadable
	};
}

export function describeKitVersionsRead(read: KitVersionsRead): string {
	const latestLine = read.latestIsRead ? '' : ' The latest version could not be read from project-process.';
	const unreadableLine =
		read.projectsUnreadable === 0
			? ''
			: ` ${read.projectsUnreadable} could not be read — a private repository needs GITHUB_TOKEN set on the site.`;
	return `Read the kit version on ${read.projectsRead} repositories.${latestLine}${unreadableLine}`;
}
