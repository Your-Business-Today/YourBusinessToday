import { answerDesignRequestAction } from '$lib/server/designReviews/answerDesignRequestAction';
import { approveGoalRequestsAction } from '$lib/server/designReviews/approveGoalRequestsAction';
import { requestedGoalsOf } from '$lib/data/requestedGoals';
import { getGoalsForProject } from '$lib/server/goals/getGoalsForProject';
import { getTasksForProject } from '$lib/server/projects/getTasksForProject';
import { readDevelopmentTabCounts } from '$lib/server/projects/readDevelopmentTabCounts';
import { readTogether } from '$lib/server/http/readTogether';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { isStaffMember } from '$lib/server/auth/requireOrganisationAccess';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { project } = await requireProjectAccess(locals, params.projectId);
	const { supabase } = locals;
	const reads = await readTogether({
		tasks: getTasksForProject(supabase, project.id),
		goals: getGoalsForProject(supabase, project.id),
		developmentTabCounts: readDevelopmentTabCounts(supabase, project.id),
		canAnswerDesignRequests: isStaffMember(locals)
	});
	const { tasks, goals, ...shown } = reads;
	return { project, requestedGoals: requestedGoalsOf(tasks, goals), ...shown };
};

export const actions = {
	answerDesignRequest: answerDesignRequestAction,
	approveGoalRequests: approveGoalRequestsAction
} satisfies Actions;
