import { loadDocumentReading } from '$lib/server/projectDocuments/documentPageLoads';
import { reachProductPage } from '$lib/server/projectDocuments/documentPageOwner';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { locals, params } = event;
	const { project } = await requireProjectAccess(locals, params.projectId);
	return { project, ...(await loadDocumentReading(reachProductPage, event)) };
};
