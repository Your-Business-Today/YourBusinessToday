import { error } from '@sveltejs/kit';
import { getPortalProject } from './getPortalProjects';
import { requirePortalVisitor } from './requirePortalVisitor';
import { requireUser } from '$lib/server/auth/requireUser';
import type { PortalProject } from '$lib/portal/portalProject';
import type { PortalVisitor } from '$lib/portal/portalVisitor';

const notFound = 404;

export type PortalProjectAccess = { accountId: string; visitor: PortalVisitor; project: PortalProject };

/** The signed-in contact and one of their organisation's projects, read on their own account; 404 for any other. */
export async function requirePortalProject(locals: App.Locals, projectId: string): Promise<PortalProjectAccess> {
	const user = await requireUser(locals);
	const visitor = await requirePortalVisitor(locals);
	const project = await getPortalProject(locals.supabase, projectId, visitor.clientId);
	if (project === null) error(notFound, 'There is no such project for your organisation.');
	return { accountId: user.id, visitor, project };
}
