import { readWorkflowMapOfClient } from '$lib/server/workflowMap/readWorkflowMapOfClient';
import { requireLinkedPortalVisitor } from '$lib/server/portal/requireLinkedPortalVisitor';
import { portalWorkflowMapActions } from './portalWorkflowMapActions';
import type { Actions, PageServerLoad } from './$types';

const chosenStationParameter = 'station';

export const load: PageServerLoad = async (page) => {
	const { url } = page;
	const visitor = await requireLinkedPortalVisitor(page);
	const reading = await readWorkflowMapOfClient(visitor.clientId);
	const chosenStationKey = url.searchParams.get(chosenStationParameter);
	return { visitor, reading, chosenStationKey };
};

export const actions: Actions = portalWorkflowMapActions;
