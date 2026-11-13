import { blueprintActions } from '../blueprintActions';
import { loadBlueprintPage } from '$lib/server/blueprint/loadBlueprintPage';
import { readDevelopmentTabCounts } from '$lib/server/projects/readDevelopmentTabCounts';
import { readLatestJourneyMap } from '$lib/server/journeyMap/readLatestJourneyMap';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const blueprintPage = await loadBlueprintPage(locals, params.projectId);
	const { project } = blueprintPage;
	const [developmentTabCounts, journeyMap] = await Promise.all([
		readDevelopmentTabCounts(locals.supabase, project.id),
		readLatestJourneyMap(supabaseServiceClient(), project.id)
	]);
	return { ...blueprintPage, developmentTabCounts, journeyMap };
};

export const actions = { ...blueprintActions } satisfies Actions;
