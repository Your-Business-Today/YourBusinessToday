import { blueprintActions } from '../blueprintActions';
import { loadBlueprintPage } from '$lib/server/blueprint/loadBlueprintPage';
import { readDevelopmentTabCounts } from '$lib/server/projects/readDevelopmentTabCounts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const blueprintPage = await loadBlueprintPage(locals, params.projectId);
	const { project } = blueprintPage;
	const developmentTabCounts = await readDevelopmentTabCounts(locals.supabase, project.id);
	return { ...blueprintPage, developmentTabCounts };
};

export const actions = { ...blueprintActions } satisfies Actions;
