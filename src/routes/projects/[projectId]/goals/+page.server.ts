import { goalActions } from '../goalActions';
import { readDevelopmentGoals } from '$lib/server/projects/readDevelopmentGoals';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { project } = await requireProjectAccess(locals, params.projectId);
	const goalsTab = await readDevelopmentGoals(locals.supabase, project.id);
	return { project, ...goalsTab };
};

export const actions = { ...goalActions } satisfies Actions;
