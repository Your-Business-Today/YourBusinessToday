import { blueprintActions } from '../blueprintActions';
import { loadBlueprintPage } from '$lib/server/blueprint/loadBlueprintPage';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => loadBlueprintPage(locals, params.projectId);

export const actions = { ...blueprintActions } satisfies Actions;
