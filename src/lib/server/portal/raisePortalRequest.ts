import { countSupportTasksRaisedToday, dailyRaiseCeiling } from '$lib/server/support/raiseCeiling';
import { createSupportTask } from '$lib/server/support/createSupportTask';
import { getProject } from '$lib/server/projects/getProject';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { PortalRequestSeed, Refusal } from './validatePortalRequest';

const clientRole = 'client';

export type RaisedRequest = { taskId: string };

/**
 * Raises the request as a support task on the project, in the contact's name. A contact may not write tasks
 * themselves, so the task is written with the service key — only after the portal has read the project on the
 * contact's own account and checked every value.
 */
export async function raisePortalRequest(
	accountId: string,
	projectId: string,
	seed: PortalRequestSeed,
	contactRole: string
): Promise<RaisedRequest | Refusal> {
	const service = supabaseServiceClient();
	const raisedToday = await countSupportTasksRaisedToday(service, accountId);
	if (raisedToday >= dailyRaiseCeiling)
		return { refusal: `You have raised ${raisedToday} requests today, which is the daily limit. Try again tomorrow.` };
	const project = await getProject(service, projectId);
	if (project === null) return { refusal: 'There is no such project for your organisation.' };
	const taskId = await createSupportTask(
		service,
		project,
		{ goalId: null, parentTaskId: null, ...seed, raiserRole: contactRole || clientRole },
		accountId
	);
	return { taskId };
}
