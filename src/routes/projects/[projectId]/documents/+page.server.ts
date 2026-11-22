import { readKeptDocuments } from '$lib/server/projectDocuments/findProjectDocuments';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { documentActions } from './documentActions';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { project } = await requireProjectAccess(locals, params.projectId);
	return { project, documents: await readKeptDocuments(locals.supabase, project.id) };
};

export const actions = { ...documentActions } satisfies Actions;
