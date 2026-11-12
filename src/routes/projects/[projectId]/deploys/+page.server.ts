import { deployHistoryOf } from '$lib/data/deployHistory';
import { findLiveTasks } from '$lib/server/projects/findLiveTasks';
import { readDevelopmentTabCounts } from '$lib/server/projects/readDevelopmentTabCounts';
import { readTogether } from '$lib/server/http/readTogether';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { project } = await requireProjectAccess(locals, params.projectId);
	const { liveTasks, developmentTabCounts } = await readTogether({
		liveTasks: findLiveTasks(locals.supabase, project.id),
		developmentTabCounts: readDevelopmentTabCounts(locals.supabase, project.id)
	});
	return { project, deploys: deployHistoryOf(liveTasks), developmentTabCounts };
};
