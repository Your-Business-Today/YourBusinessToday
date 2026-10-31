import { error } from '@sveltejs/kit';
import { getProject } from '$lib/server/projects/getProject';
import { requireUser } from './requireUser';
import type { Project } from '$lib/server/projects/projectRecord';
import type { User } from '@supabase/supabase-js';

export type ProjectAccess = { user: User; project: Project; isOwner: boolean };

/** Row level security hides a project from anyone not on it, so a missing row is a 404. */
export async function requireProjectAccess(
	locals: App.Locals,
	projectId: string
): Promise<ProjectAccess> {
	const [user, project] = await Promise.all([requireUser(locals), getProject(locals.supabase, projectId)]);
	if (project === null) error(404, 'Project not found');
	return { user, project, isOwner: project.ownerId === user.id };
}
