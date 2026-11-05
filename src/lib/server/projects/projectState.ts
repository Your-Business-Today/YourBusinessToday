import { blockingPeopleOf, type PersonBlocking } from './projectBlocking';
import { goalProgressOf, type GoalProgress } from './projectGoalProgress';
import { developmentKindOfTask, developmentKinds } from '$lib/data/developmentKind';
import { isDevelopment } from '$lib/data/department';
import { isTaskDone } from '$lib/data/taskStatus';
import { isWithinDays } from '$lib/data/ageInDays';
import { movementWindowDays, projectVerdicts, stalledAfterDays, type ProjectVerdict } from '$lib/data/projectVerdict';
import { nextStepOf, type NextStep } from './projectNextStep';
import type { ConversationTurn } from '$lib/data/conversationTurn';
import type { Goal } from '$lib/server/goals/goalRecord';
import type { ProjectTask } from './taskRecord';

/** How a project truly stands: its verdict, its open bugs, who it waits on, its goals, its week, and what comes next. */
export type ProjectState = {
	verdict: ProjectVerdict;
	openBugs: ProjectTask[];
	blocking: PersonBlocking[];
	goals: GoalProgress[];
	mergedThisWeekCount: number;
	bugsFixedThisWeekCount: number;
	nextStep: NextStep | null;
};

export type ProjectStateSources = {
	tasks: ProjectTask[];
	goals: Goal[];
	turnsByTask: Map<string, ConversationTurn>;
	now: Date;
};

/** The same reading drives the card on the project page and read_project_state, so the two never disagree. */
export function projectStateOf(sources: ProjectStateSources): ProjectState {
	const { tasks, now } = sources;
	const tasksById = new Map(tasks.map((task) => [task.id, task]));
	const isBug = (task: ProjectTask) =>
		isDevelopment(task.department) && developmentKindOfTask(task, tasksById) === developmentKinds.bug;
	const openBugs = tasks.filter((task) => isBug(task) && !isTaskDone(task.status));
	const merged = tasks.filter((task) => isWithinDays(task.stagedAt, movementWindowDays, now));
	const blocking = blockingPeopleOf(sources);
	return {
		verdict: verdictOf(openBugs.length, blocking.length, hasMovedLately(sources)),
		openBugs,
		blocking,
		goals: goalProgressOf(sources),
		mergedThisWeekCount: merged.length,
		bugsFixedThisWeekCount: merged.filter(isBug).length,
		nextStep: nextStepOf(sources, openBugs)
	};
}

function verdictOf(openBugCount: number, blockingCount: number, hasMoved: boolean): ProjectVerdict {
	if (openBugCount > 0) return projectVerdicts.bugsOpen;
	if (blockingCount > 0) return projectVerdicts.waitingOnPeople;
	if (!hasMoved) return projectVerdicts.stalled;
	return projectVerdicts.onTrack;
}

function hasMovedLately({ tasks, turnsByTask, now }: ProjectStateSources): boolean {
	const openTasks = tasks.filter((task) => !isTaskDone(task.status));
	if (openTasks.length === 0) return true;
	const isRecent = (moment: string | null) => isWithinDays(moment, stalledAfterDays, now);
	const hasTaskMoved = tasks.some((task) => isRecent(task.stagedAt) || isRecent(task.resolvedAt) || isRecent(task.createdAt));
	const hasConversationMoved = [...turnsByTask.values()].some((turn) => isRecent(turn.since));
	return hasTaskMoved || hasConversationMoved;
}
