import { getPortalRequests } from '$lib/server/portal/getPortalRequests';
import { portalRequestActions } from './portalRequestActions';
import { requirePortalProject } from '$lib/server/portal/requirePortalProject';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { visitor, project } = await requirePortalProject(locals, params.projectId);
	const requests = await getPortalRequests(locals.supabase, project.id);
	return { visitor, project, requests };
};

export const actions = { ...portalRequestActions } satisfies Actions;
