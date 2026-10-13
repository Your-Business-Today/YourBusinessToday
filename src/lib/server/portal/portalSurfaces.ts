/** The views migration 0100 opens to a client contact: only the columns the portal shows, only on their client's projects. */
export const PortalSurfaces = {
	projects: 'portal_projects',
	goals: 'portal_goals',
	tasks: 'portal_tasks'
} as const;

export const PortalSurfaceColumns = {
	projects: 'id, name, status, client_id, environment_url',
	goals: 'id, project_id, title, measure, status, horizon, priority',
	tasks: 'id, project_id, parent_task_id, goal_id, kind, title, status, priority, story_points, completion_percent'
} as const;

export type PortalWorkSurface = typeof PortalSurfaces.goals | typeof PortalSurfaces.tasks;
