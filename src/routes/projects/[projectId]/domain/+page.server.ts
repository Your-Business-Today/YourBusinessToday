import { blueprintActions } from '../blueprintActions';
import { loadBlueprintPage } from '$lib/server/blueprint/loadBlueprintPage';
import { readProductBrainOnSite } from '$lib/server/businessBrain/readProductBrainOnSite';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const blueprintPage = await loadBlueprintPage(locals, params.projectId);
	return { ...blueprintPage, productBrain: await readProductBrainOnSite(locals, blueprintPage.project) };
};

export const actions = { ...blueprintActions } satisfies Actions;
