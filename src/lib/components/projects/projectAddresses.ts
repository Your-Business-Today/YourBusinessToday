/** The pages beneath a project's board, by the segment of their address. */
export const projectSegments = {
	domain: 'domain',
	siteMap: 'site-map',
	staged: 'staged',
	deploys: 'deploys'
} as const;

/** What the board's address can name: the department open on it, and whether the scrum board is shown. */
export const boardQueryKeys = { department: 'department', view: 'view' } as const;

export function projectHref(projectId: string, segment?: string): string {
	const boardHref = `/projects/${projectId}`;
	if (segment === undefined) return boardHref;
	return `${boardHref}/${segment}`;
}
