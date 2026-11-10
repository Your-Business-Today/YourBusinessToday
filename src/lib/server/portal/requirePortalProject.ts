import { error } from '@sveltejs/kit';
import { getPortalProject } from './getPortalProjects';
import { getPortalVisitor } from './getPortalVisitor';
import { requirePortalVisitor } from './requirePortalVisitor';
import { requireUser } from '$lib/server/auth/requireUser';
import type { PortalProject } from '$lib/portal/portalProject';
import type { PortalVisitor } from '$lib/portal/portalVisitor';

const notFound = 404;

export type PortalProjectAccess = { accountId: string; visitor: PortalVisitor; project: PortalProject };

/**
 * The signed-in contact and one of their organisations' projects, working as their contact at the
 * project's client whichever company the portal last worked in; 404 for any other project.
 */
export async function requirePortalProject(locals: App.Locals, projectId: string): Promise<PortalProjectAccess> {
	const user = await requireUser(locals);
	const visitor = await requirePortalVisitor(locals);
	const clientIds = visitor.organisations.map((organisation) => organisation.clientId);
	const project = await getPortalProject(locals.supabase, projectId, clientIds);
	if (project === null) error(notFound, 'There is no such project for your organisation.');
	const projectVisitor = await visitorAtProjectClient(locals, user.id, visitor, project);
	return { accountId: user.id, visitor: projectVisitor, project };
}

async function visitorAtProjectClient(
	locals: App.Locals,
	accountId: string,
	visitor: PortalVisitor,
	project: PortalProject
): Promise<PortalVisitor> {
	if (project.clientId === visitor.clientId) return visitor;
	const projectVisitor = await getPortalVisitor(locals.supabase, accountId, project.clientId);
	return projectVisitor ?? visitor;
}
