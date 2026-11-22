import { readKeptDocuments } from '$lib/server/projectDocuments/findProjectDocuments';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { project } = await requireProjectAccess(locals, params.projectId);
	return { project, documents: await readKeptDocuments(locals.supabase, project.id) };
};
