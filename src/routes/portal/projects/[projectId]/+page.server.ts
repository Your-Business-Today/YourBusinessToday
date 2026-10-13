import { error } from '@sveltejs/kit';
import { getPortalProject } from '$lib/server/portal/getPortalProjects';
import { requirePortalVisitor } from '$lib/server/portal/requirePortalVisitor';
import type { PageServerLoad } from './$types';

const notFound = 404;

export const load: PageServerLoad = async ({ locals, params }) => {
	const visitor = await requirePortalVisitor(locals);
	const project = await getPortalProject(locals.supabase, params.projectId, visitor.clientId);
	if (project === null) error(notFound, 'There is no such project for your organisation.');
	return { visitor, project };
};
