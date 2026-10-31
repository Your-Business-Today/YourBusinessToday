import { autocompleteActions } from './autocompleteActions';
import { buildTaskTree } from '$lib/server/projects/buildTaskTree';
import { countDeploysSinceRefactor } from '$lib/server/deploys/countDeploysSinceRefactor';
import { describeRefactorCadence } from '$lib/server/refactor/isRefactorRoundDue';
import { getBranchRunsForProject } from '$lib/server/mainRuns/getMainRunsForProject';
import { getBuildBoard } from '$lib/server/lifecycle/getBuildBoard';
import { getLatestKitVersion } from '$lib/server/kit/kitVersions';
import { getOrganisations } from '$lib/server/organisations/getOrganisations';
import { summariseGoals } from '$lib/server/goals/summariseGoals';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { getAssigneeIdsByTask } from '$lib/server/projects/getAssigneeIdsByTask';
import { getTaskTurns } from '$lib/server/conversations/conversationTurns';
import { goalActions } from './goalActions';
import { memberActions } from './memberActions';
import { projectActions } from './projectActions';
import { summariseProjectPulse } from '$lib/server/projects/summariseProjectPulse';
import { deployWindowFactsOf } from '$lib/server/deployWindows/deployWindowFactsOf';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { isStaffMember } from '$lib/server/auth/requireOrganisationAccess';
import { sequenceStandingsOf } from '$lib/data/taskSequenceStanding';
import { stagedTasksOf } from '$lib/data/stagedTasks';
import { taskActions } from './taskActions';
import { loadDepartmentWork } from '$lib/server/departments/loadDepartmentWork';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const { project, isOwner, user } = await requireProjectAccess(locals, params.projectId);
	const { projectTasks, tasks, goals, ...board } = await loadDepartmentWork(locals.supabase, project.id, url);
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
		canTurnOnAutocomplete: await isStaffMember(locals),
		cadenceLine: describeRefactorCadence({ refactorEveryDeploys: project.refactorEveryDeploys, deploysSinceRefactor }),
		deployWindowFacts: await deployWindowFactsOf(locals.supabase, project),
		pulse: summariseProjectPulse({ tasks, goals, assigneeIdsByTask, turnsByTask, viewerId: user.id }),
		taskTree: buildTaskTree(tasks),
		stagedTasks: stagedTasksOf(tasks),
		goalSummaries: summariseGoals(goals, tasks),
		goals,
		people: await getPeopleOnProject(locals.supabase, project.id),
		assigneeIdsByTask: Object.fromEntries(assigneeIdsByTask),
		turnsByTask: Object.fromEntries(turnsByTask),
		sequenceByTask: sequenceStandingsOf(projectTasks),
		...board,
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
