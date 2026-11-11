import { autocompleteActions } from './autocompleteActions';
import { buildTaskTree } from '$lib/server/projects/buildTaskTree';
import { summariseGoals } from '$lib/server/goals/summariseGoals';
import { goalActions } from './goalActions';
import { internalWorkActions } from './internalWorkActions';
import { memberActions } from './memberActions';
import { projectActions } from './projectActions';
import { summariseProjectPulse } from '$lib/server/projects/summariseProjectPulse';
import { projectStateOf } from '$lib/server/projects/projectState';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { sequenceStandingsOf } from '$lib/data/taskSequenceStanding';
import { taskActions } from './taskActions';
import { readBoard } from './readBoard';
import { developmentViewOf } from '$lib/data/developmentView';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const { project, isOwner, user } = await requireProjectAccess(locals, params.projectId);
	const { work, assigneeIdsByTask, turnsByTask, buildBoard, ...reads } = await readBoard(locals, project, url);
	const { projectTasks, projectGoals, tasks, goals, ...board } = work;
	return {
		project,
		...reads,
		isOwner,
		projectState: projectStateOf({ tasks: projectTasks, goals: projectGoals, turnsByTask, now: new Date() }),
		pulse: summariseProjectPulse({ tasks, goals, assigneeIdsByTask, turnsByTask, viewerId: user.id }),
		taskTree: buildTaskTree(tasks),
		goalSummaries: summariseGoals(goals, tasks),
		goals,
		assigneeIdsByTask: Object.fromEntries(assigneeIdsByTask),
		turnsByTask: Object.fromEntries(turnsByTask),
		sequenceByTask: sequenceStandingsOf(projectTasks),
		...board,
		...buildBoard,
		developmentView: developmentViewOf(url),
		viewerId: user.id
	};
};

export const actions = {
	...projectActions,
	...goalActions,
	...memberActions,
	...taskActions,
	...autocompleteActions,
	...internalWorkActions
} satisfies Actions;
