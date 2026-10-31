import { autocompleteActions } from './autocompleteActions';
import { buildTaskTree } from '$lib/server/projects/buildTaskTree';
import { describeRefactorCadence } from '$lib/server/refactor/isRefactorRoundDue';
import { summariseGoals } from '$lib/server/goals/summariseGoals';
import { goalActions } from './goalActions';
import { memberActions } from './memberActions';
import { projectActions } from './projectActions';
import { summariseProjectPulse } from '$lib/server/projects/summariseProjectPulse';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { sequenceStandingsOf } from '$lib/data/taskSequenceStanding';
import { stagedTasksOf } from '$lib/data/stagedTasks';
import { taskActions } from './taskActions';
import { readBoard } from './readBoard';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const { project, isOwner, user } = await requireProjectAccess(locals, params.projectId);
	const { work, assigneeIdsByTask, turnsByTask, deploysSinceRefactor, branchRuns, buildBoard, ...reads } =
		await readBoard(locals, project, url);
	const { projectTasks, tasks, goals, ...board } = work;
	return {
		project,
		...reads,
		...branchRuns,
		isOwner,
		cadenceLine: describeRefactorCadence({ refactorEveryDeploys: project.refactorEveryDeploys, deploysSinceRefactor }),
		pulse: summariseProjectPulse({ tasks, goals, assigneeIdsByTask, turnsByTask, viewerId: user.id }),
		taskTree: buildTaskTree(tasks),
		stagedTasks: stagedTasksOf(tasks),
		goalSummaries: summariseGoals(goals, tasks),
		goals,
		assigneeIdsByTask: Object.fromEntries(assigneeIdsByTask),
		turnsByTask: Object.fromEntries(turnsByTask),
		sequenceByTask: sequenceStandingsOf(projectTasks),
		...board,
		...buildBoard,
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
