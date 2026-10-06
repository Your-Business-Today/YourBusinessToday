import type { KitReading } from '$lib/data/kitVersion';
import type { Project } from '$lib/server/projects/projectRecord';

/** What a project's record says about its kit: a repository whose version was never stored reads as not read, not as kit-less. */
export function kitReadingOf(project: Project, latestKitVersion: string): KitReading {
	return {
		hasRepository: project.repositoryUrl !== '',
		isRead: project.kitVersionReadAt !== null,
		kitVersion: project.kitVersion,
		latestKitVersion
	};
}
