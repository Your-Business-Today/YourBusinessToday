import { buildTaskTree } from '$lib/server/projects/buildTaskTree';
import { countDeploysSinceRefactor } from '$lib/server/deploys/countDeploysSinceRefactor';
import { describeRefactorCadence } from '$lib/server/refactor/isRefactorRoundDue';
import { getLatestKitVersion } from '$lib/server/kit/kitVersions';
import { getGoalSummaries } from '$lib/server/goals/getGoalSummaries';
import { getProjectGoals } from '$lib/server/goals/getProjectGoals';
import { getProjectPeople } from '$lib/server/members/getProjectPeople';
import { getProjectTasks } from '$lib/server/projects/getProjectTasks';
import { getTaskAssigneeMap } from '$lib/server/projects/getTaskAssigneeMap';
import { getTaskTurns } from '$lib/server/conversations/conversationTurns';
import { getProjectImages } from '$lib/server/projectImages/getProjectImages';
import { goalActions } from './goalActions';
import { imageActions } from './imageActions';
import { memberActions } from './memberActions';
import { openTaskChoices } from '$lib/server/projects/openTaskChoices';
import { projectActions } from './projectActions';
import { summariseProjectPulse } from '$lib/server/projects/summariseProjectPulse';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { taskActions } from './taskActions';
import { withUploaderNames } from '$lib/server/projects/uploaderNames';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { project, isOwner, user } = await requireProjectAccess(locals, params.projectId);
	const tasks = await getProjectTasks(locals.supabase, project.id);
	const goals = await getProjectGoals(locals.supabase, project.id);
	const taskIds = tasks.map((task) => task.id);
	const assigneeIdsByTask = await getTaskAssigneeMap(locals.supabase, taskIds);
	const turnsByTask = await getTaskTurns(locals.supabase, taskIds);
	const deploysSinceRefactor = await countDeploysSinceRefactor(locals.supabase, project);
	const people = await getProjectPeople(locals.supabase, project.id);
	const images = await getProjectImages(locals.supabase, project.id);
	return {
		project,
		latestKitVersion: await getLatestKitVersion(locals.supabase),
		isOwner,
		cadenceLine: describeRefactorCadence({
			refactorEveryDeploys: project.refactorEveryDeploys,
			deploysSinceRefactor
		}),
		pulse: summariseProjectPulse({ tasks, assigneeIdsByTask, turnsByTask, viewerId: user.id }),
		taskTree: buildTaskTree(tasks),
		goalSummaries: getGoalSummaries(goals, tasks),
		goals,
		people,
		images: withUploaderNames(images, people),
		taskChoices: openTaskChoices(tasks),
		assigneeIdsByTask: Object.fromEntries(assigneeIdsByTask),
		turnsByTask: Object.fromEntries(turnsByTask),
		viewerId: user.id
	};
};

export const actions = {
	...projectActions,
	...goalActions,
	...memberActions,
	...taskActions,
	...imageActions
} satisfies Actions;
