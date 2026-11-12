import { memberActions } from '../memberActions';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { readDevelopmentTabCounts } from '$lib/server/projects/readDevelopmentTabCounts';
import { readTogether } from '$lib/server/http/readTogether';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { project, isOwner } = await requireProjectAccess(locals, params.projectId);
	const { supabase } = locals;
	const reads = await readTogether({
		people: getPeopleOnProject(supabase, project.id),
		developmentTabCounts: readDevelopmentTabCounts(supabase, project.id)
	});
	return { project, isOwner, ...reads };
};

export const actions = { ...memberActions } satisfies Actions;
