import { readKeptDocuments } from '$lib/server/projectDocuments/findProjectDocuments';
import { readLibrarySearch } from '$lib/server/projectLibrary/readLibrarySearch';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { documentActions } from './documentActions';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const { project } = await requireProjectAccess(locals, params.projectId);
	const search = await readLibrarySearch(locals.supabase, project.id, url);
	return { project, search, documents: await readKeptDocuments(locals.supabase, project.id) };
};

export const actions = { ...documentActions } satisfies Actions;
