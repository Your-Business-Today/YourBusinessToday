/** The pages beneath a project's board, by the segment of their address. */
export const projectSegments = {
	workflowMap: 'workflow-map',
	siteMap: 'site-map',
	staged: 'staged',
	deploys: 'deploys',
	goals: 'goals',
	people: 'people'
} as const;

/** What the board's address can name: the department open on it. */
export const boardQueryKeys = { department: 'department' } as const;

export function projectHref(projectId: string, segment?: string): string {
	const boardHref = `/projects/${projectId}`;
	if (segment === undefined) return boardHref;
	return `${boardHref}/${segment}`;
}
