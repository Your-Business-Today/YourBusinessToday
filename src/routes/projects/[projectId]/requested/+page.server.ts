import { findDesignRequests } from '$lib/server/designReviews/findDesignRequests';
import { readDevelopmentTabCounts } from '$lib/server/projects/readDevelopmentTabCounts';
import { readTogether } from '$lib/server/http/readTogether';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { project } = await requireProjectAccess(locals, params.projectId);
	const { supabase } = locals;
	const reads = await readTogether({
		designRequests: findDesignRequests(supabase, [project.id]),
		developmentTabCounts: readDevelopmentTabCounts(supabase, project.id)
	});
	return { project, requestedTasks: reads.designRequests.map(({ task }) => task), developmentTabCounts: reads.developmentTabCounts };
};
