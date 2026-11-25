import { redirect } from '@sveltejs/kit';
import { autocompleteActions } from './autocompleteActions';
import { priorityMarkActions } from './priorityMarkActions';
import { teamJobsAddressFor } from '$lib/components/projects/teamJobsAddress';
import { designRequestCountOf, developmentTabCountsOf } from '$lib/components/projects/developmentTabCounts';
import { buildTaskTree } from '$lib/server/projects/buildTaskTree';
import { summariseGoals } from '$lib/server/goals/summariseGoals';
import { goalActions } from './goalActions';
import { internalWorkActions } from './internalWorkActions';
import { memberActions } from './memberActions';
import { projectActions } from './projectActions';
import { summariseProjectPulse } from '$lib/server/projects/summariseProjectPulse';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { sequenceStandingsOf } from '$lib/data/taskSequenceStanding';
import { taskActions } from './taskActions';
import { readBoard } from './readBoard';
import { assignedElsewhere } from '$lib/data/assignedElsewhere';
import { assignedElsewhereLinks } from '$lib/components/projects/assignedElsewhereLinks';
import { tabsShownWith } from '$lib/data/departmentBoard';
import { nextActionIdsOf, taskIdsWithMoveOf } from '$lib/data/nextActionIds';
import type { Actions, PageServerLoad } from './$types';

const seeOther = 303;

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const { project, isOwner, user } = await requireProjectAccess(locals, params.projectId);
	const { work, assigneeIdsByTask, turnsByTask, buildBoard, stagedTaskCount, nextActionsByTask, ...reads } = await readBoard(locals, project, url);
	const { projectTasks, projectGoals, tasks, goals, departmentTabs, shownSides, ...board } = work;
	const nextActionIdsByTask = nextActionIdsOf(nextActionsByTask);
	const viewersMoveTaskIds = taskIdsWithMoveOf(nextActionIdsByTask, user.id);
	const elsewhere = assignedElsewhere({ tasks: projectTasks, goals: projectGoals, assignedTaskIds: viewersMoveTaskIds, shownTabs: tabsShownWith(board.boardTab) });
	const teamJobsAddress = teamJobsAddressFor(project, url, shownSides);
	if (teamJobsAddress !== null) redirect(seeOther, teamJobsAddress);
	return {
		project,
		...reads,
		isOwner,
		pulse: summariseProjectPulse({ tasks, goals, viewersMoveTaskIds, turnsByTask, viewerId: user.id }),
		taskTree: buildTaskTree(tasks),
		goalSummaries: summariseGoals(goals, tasks),
		goals,
		assigneeIdsByTask: Object.fromEntries(assigneeIdsByTask),
		nextActionIdsByTask,
		turnsByTask: Object.fromEntries(turnsByTask),
		sequenceByTask: sequenceStandingsOf(projectTasks),
		...board,
		developmentTabCounts: developmentTabCountsOf(departmentTabs, stagedTaskCount, designRequestCountOf(projectTasks)),
		...buildBoard,
		viewerId: user.id,
		assignedElsewhere: assignedElsewhereLinks(project, elsewhere, shownSides)
	};
};

export const actions = {
	...projectActions,
	...goalActions,
	...memberActions,
	...taskActions,
	...autocompleteActions,
	...priorityMarkActions,
	...internalWorkActions
} satisfies Actions;
