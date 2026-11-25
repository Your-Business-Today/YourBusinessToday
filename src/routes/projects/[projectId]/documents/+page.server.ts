import { documentPageActions } from '$lib/server/projectDocuments/documentPageActions';
import { loadDocumentShelf } from '$lib/server/projectDocuments/documentPageLoads';
import { reachProductPage } from '$lib/server/projectDocuments/documentPageOwner';
import { readLibrarySearch } from '$lib/server/projectLibrary/readLibrarySearch';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { locals, params, url } = event;
	const { project } = await requireProjectAccess(locals, params.projectId);
	const search = await readLibrarySearch(locals.supabase, project.id, url);
	const { documents } = await loadDocumentShelf(reachProductPage, event);
	return { project, search, documents };
};

export const actions = documentPageActions(reachProductPage) satisfies Actions;
