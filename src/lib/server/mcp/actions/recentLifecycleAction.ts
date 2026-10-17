import { getRecentLifecycleSteps } from '$lib/server/lifecycle/getRecentLifecycleSteps';
import { objectSchema } from '../actionTypes';
import { reachableProjectIds } from '../projectAccess';
import {
	recentLifecycleLimitRefusal,
	recentLifecycleLimits,
	validateRecentLifecycleLimit
} from '$lib/data/recentLifecycleLimit';
import type { McpAction } from '../actionTypes';

export const recentLifecycleAction: McpAction = {
	name: 'read_recent_lifecycle',
	area: 'tasks',
	audience: 'everyone',
	isWrite: false,
	summary:
		'the newest lifecycle steps across every project you can reach, newest first, each with its agent, model, outcome, note and the title of its task or goal',
	guidance:
		'For an app showing what the AIs are deciding, such as the YBT desktop app; it answers JSON. ' +
		'To read one task or goal’s steps, call read_lifecycle instead.',
	inputSchema: objectSchema({
		limit: {
			type: 'integer',
			description: `How many steps, ${recentLifecycleLimits.fewest} to ${recentLifecycleLimits.most} — ${recentLifecycleLimits.usual} when left out`
		}
	}),
	run: async (caller, input) => {
		const limit = validateRecentLifecycleLimit(input.limit);
		if (limit === undefined) return recentLifecycleLimitRefusal;
		const projectIds = reachableProjectIds(caller);
		const steps = await getRecentLifecycleSteps(caller.supabase, projectIds, limit);
		return { data: { steps } };
	}
};
