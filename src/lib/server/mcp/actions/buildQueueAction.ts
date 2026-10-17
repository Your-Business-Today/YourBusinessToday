import { buildQueueEntries } from '$lib/server/buildModels/buildQueueEntries';
import { getBuildModelSettings } from '$lib/server/buildModels/getBuildModelSettings';
import { getLifecycleMarks } from '$lib/server/lifecycle/getLifecycleMarks';
import { objectSchema } from '../actionTypes';
import { reachableProjectIds } from '../projectAccess';
import { readBuildCandidates } from '$lib/server/buildModels/readBuildCandidates';
import type { McpAction } from '../actionTypes';

export const buildQueueAction: McpAction = {
	name: 'read_build_queue',
	area: 'tasks',
	audience: 'everyone',
	isWrite: false,
	summary:
		'the build board as data: every open buildable task you can reach in queue order, with its points, the model it needs (and the one named on it, if any), its latest lifecycle step and who holds it, and the models with their ranges',
	guidance:
		'For an app drawing the board, such as the YBT desktop app; it answers JSON. To take work, call ' +
		'next_buildable_task instead, which claims the task for you.',
	inputSchema: objectSchema({}),
	run: async (caller) => {
		const projectIds = reachableProjectIds(caller);
		const [candidates, marks, settings] = await Promise.all([
			readBuildCandidates(caller.supabase, projectIds),
			getLifecycleMarks(caller.supabase, projectIds),
			getBuildModelSettings(caller.supabase)
		]);
		const { models, reviewModelId } = settings;
		return { data: { models, reviewModelId, tasks: buildQueueEntries(candidates, marks, models) } };
	}
};
