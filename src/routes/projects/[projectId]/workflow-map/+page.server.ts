import { readWorkflowMapForProduct } from '$lib/server/workflowMap/readWorkflowMapForProduct';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { project } = await requireProjectAccess(locals, params.projectId);
	return { project, reading: await readWorkflowMapForProduct(locals, project) };
};
