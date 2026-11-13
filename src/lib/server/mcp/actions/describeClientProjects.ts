import type { OrganisationProject } from '$lib/server/projects/getProjectsOfOrganisation';

/** The client's projects a service goal can be raised on, each saying whether it is on their portal. */
export function clientProjectSection(organisationName: string, projects: OrganisationProject[]): string {
	const heading = "### The client's projects";
	if (projects.length === 0) return `${heading}\nNo project is under ${organisationName} yet, so no goal can be raised.`;
	const lines = projects.map((project) => {
		const portal = project.isOnClientPortal ? 'on their portal' : 'not on their portal';
		return `- ${project.name} (project id: ${project.id}), ${portal}`;
	});
	return [heading, ...lines].join('\n');
}
