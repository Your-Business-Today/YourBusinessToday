type ClientOwned = { clientId: string | null };

/**
 * Whether a project is one YBT runs for this client. The portal surfaces already
 * limit a contact to their client's projects; this is the portal's own word on
 * it, so a contact never sees another client's project even if a surface widens.
 */
export function isProjectOfClient(project: ClientOwned, clientId: string): boolean {
	return project.clientId !== null && project.clientId === clientId;
}

export function projectsOfClient<Project extends ClientOwned>(
	projects: Project[],
	clientId: string
): Project[] {
	return projects.filter((project) => isProjectOfClient(project, clientId));
}
