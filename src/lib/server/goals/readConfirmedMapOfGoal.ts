import { findConfirmedMapVersion, type ConfirmedMapVersion } from '$lib/server/workflowMap/readConfirmedMapVersions';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { Goal } from './goalRecord';

/**
 * The confirmed workflow map version a goal was raised from; none for any other goal. The map's tables are the
 * server's alone, so this reads with the service key: only call it once the caller has been let in to the goal's project.
 */
export async function readConfirmedMapOfGoal(goal: Goal): Promise<ConfirmedMapVersion | null> {
	if (goal.workflowMapVersionId === null) return null;
	return findConfirmedMapVersion(supabaseServiceClient(), goal.workflowMapVersionId);
}
