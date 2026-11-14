import { redirect } from '@sveltejs/kit';
import { autocompleteActions } from './autocompleteActions';
import { teamJobsAddressFor } from '$lib/components/projects/teamJobsAddress';
import { developmentTabCountsOf } from '$lib/components/projects/developmentTabCounts';
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
import type { Actions, PageServerLoad } from './$types';

const seeOther = 303;

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const { project, isOwner, user } = await requireProjectAccess(locals, params.projectId);
	const { work, assigneeIdsByTask, turnsByTask, buildBoard, stagedTaskCount, ...reads } = await readBoard(locals, project, url);
	const { projectTasks, projectGoals: _projectGoals, tasks, goals, departmentTabs, shownSides, ...board } = work;
	const teamJobsAddress = teamJobsAddressFor(project, url, shownSides);
	if (teamJobsAddress !== null) redirect(seeOther, teamJobsAddress);
	return {
		project,
		...reads,
		isOwner,
		pulse: summariseProjectPulse({ tasks, goals, assigneeIdsByTask, turnsByTask, viewerId: user.id }),
		taskTree: buildTaskTree(tasks),
		goalSummaries: summariseGoals(goals, tasks),
		goals,
		assigneeIdsByTask: Object.fromEntries(assigneeIdsByTask),
		turnsByTask: Object.fromEntries(turnsByTask),
		sequenceByTask: sequenceStandingsOf(projectTasks),
		...board,
		developmentTabCounts: developmentTabCountsOf(departmentTabs, stagedTaskCount),
		...buildBoard,
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
