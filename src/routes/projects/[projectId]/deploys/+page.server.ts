import { deployHistoryOf } from '$lib/data/deployHistory';
import { findLiveTasks } from '$lib/server/projects/findLiveTasks';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { project } = await requireProjectAccess(locals, params.projectId);
	const liveTasks = await findLiveTasks(locals.supabase, project.id);
	return { project, deploys: deployHistoryOf(liveTasks) };
};
