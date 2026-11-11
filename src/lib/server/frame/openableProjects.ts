import type { FramePickOption } from '$lib/components/frame/framePicks';
import type { ReachableOrganisationProject } from '$lib/server/organisations/markReachableProjects';

/**
 * Staff see every organisation's projects, but a project's page opens only for its owner and the people
 * on it, so the picker offers only those: one they are not on would open on "That page is not here".
 */
export function projectsTheyCanOpen(projects: ReachableOrganisationProject[]): FramePickOption[] {
	const openable = projects.filter((project) => project.isReachable);
	return openable.map(({ id, name }) => ({ id, name }));
}
