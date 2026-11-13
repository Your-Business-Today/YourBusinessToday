import { redirect } from '@sveltejs/kit';
import { projectHref, projectSegments } from '$lib/components/projects/projectAddresses';
import type { RequestHandler } from './$types';

const movedPermanently = 308;

export const GET: RequestHandler = ({ params }) => {
	redirect(movedPermanently, projectHref(params.projectId, projectSegments.workflowMap));
};
