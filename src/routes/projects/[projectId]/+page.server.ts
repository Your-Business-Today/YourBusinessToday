import { autocompleteActions } from './autocompleteActions';
import { buildTaskTree } from '$lib/server/projects/buildTaskTree';
import { countDeploysSinceRefactor } from '$lib/server/deploys/countDeploysSinceRefactor';
import { describeRefactorCadence } from '$lib/server/refactor/isRefactorRoundDue';
import { getBranchRunsForProject } from '$lib/server/mainRuns/getMainRunsForProject';
import { getBuildBoard } from '$lib/server/lifecycle/getBuildBoard';
import { getLatestKitVersion } from '$lib/server/kit/kitVersions';
import { getOrganisations } from '$lib/server/organisations/getOrganisations';
import { summariseGoals } from '$lib/server/goals/summariseGoals';
import { getGoalsForProject } from '$lib/server/goals/getGoalsForProject';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { getTasksForProject } from '$lib/server/projects/getTasksForProject';
import { getAssigneeIdsByTask } from '$lib/server/projects/getAssigneeIdsByTask';
import { getTaskTurns } from '$lib/server/conversations/conversationTurns';
import { goalActions } from './goalActions';
import { memberActions } from './memberActions';
import { projectActions } from './projectActions';
import { summariseProjectPulse } from '$lib/server/projects/summariseProjectPulse';
import { deployWindowFactsOf } from '$lib/server/deployWindows/deployWindowFactsOf';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { sequenceStandingsOf } from '$lib/data/taskSequenceStanding';
import { taskActions } from './taskActions';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { project, isOwner, user } = await requireProjectAccess(locals, params.projectId);
	const tasks = await getTasksForProject(locals.supabase, project.id);
	const goals = await getGoalsForProject(locals.supabase, project.id);
	const taskIds = tasks.map((task) => task.id);
	const assigneeIdsByTask = await getAssigneeIdsByTask(locals.supabase, taskIds);
	const turnsByTask = await getTaskTurns(locals.supabase, taskIds);
	const deploysSinceRefactor = await countDeploysSinceRefactor(locals.supabase, project);
	return {
		project,
		latestKitVersion: await getLatestKitVersion(locals.supabase),
		...(await getBranchRunsForProject(locals.supabase, project.id)),
		organisations: await getOrganisations(locals.supabase),
		isOwner,
		cadenceLine: describeRefactorCadence({ refactorEveryDeploys: project.refactorEveryDeploys, deploysSinceRefactor }),
		deployWindowFacts: await deployWindowFactsOf(locals.supabase, project),
		pulse: summariseProjectPulse({ tasks, goals, assigneeIdsByTask, turnsByTask, viewerId: user.id }),
		taskTree: buildTaskTree(tasks),
		goalSummaries: summariseGoals(goals, tasks),
		goals,
		people: await getPeopleOnProject(locals.supabase, project.id),
		assigneeIdsByTask: Object.fromEntries(assigneeIdsByTask),
		turnsByTask: Object.fromEntries(turnsByTask),
		sequenceByTask: sequenceStandingsOf(tasks),
		...(await getBuildBoard(locals.supabase, project.id)),
		viewerId: user.id
	};
};

export const actions = {
	...projectActions,
	...goalActions,
	...memberActions,
	...taskActions,
	...autocompleteActions
} satisfies Actions;
