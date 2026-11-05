import { agendaKey, agendaKinds, subjectKinds, type AgendaItem } from './agendaItem';
import { currentGoalHorizon, longTermGoalHorizon } from '$lib/data/goalHorizon';
import { doneTaskStatus, taskStatuses } from '$lib/data/taskStatus';
import { goalOfTask } from './boardPlacement';
import { isBugTitle } from '$lib/data/developmentKind';
import { isDevelopment } from '$lib/data/department';
import { openGoalStatus } from '$lib/data/goalStatus';
import type { AgendaBoard, BoardGoal, BoardTask } from './agendaBoard';

const buildAsk = 'Start a build thread for it now and carry on with the next item while it builds.';
const makeCurrentAsk =
	'Every current goal on the active projects is complete. Make this long term goal current to start on it, or leave it long term.';

/** Development work on current goals that can be built now: buildable, not yet started, and not waiting for an unfinished task. */
export function buildItems(board: AgendaBoard): AgendaItem[] {
	const tasks = [...board.tasksById.values()];
	return tasks.filter((task) => isReadyToBuild(task, board)).map((task) => buildItem(task, board.projectNamesById));
}

/** Once no active project has an open current goal left, each open long term goal on them, to be made current first. */
export function longTermGoalItems(board: AgendaBoard): AgendaItem[] {
	const openGoals = [...board.goalsById.values()].filter((goal) => goal.status === openGoalStatus);
	const isAnyCurrentGoalOpen = openGoals.some((goal) => goal.horizon === currentGoalHorizon);
	if (isAnyCurrentGoalOpen) return [];
	const longTermGoals = openGoals.filter((goal) => goal.horizon === longTermGoalHorizon);
	return longTermGoals.map((goal) => goalItem(goal, board.projectNamesById));
}

function isReadyToBuild(task: BoardTask, board: AgendaBoard): boolean {
	const isNotStarted = task.status === taskStatuses.backlog;
	if (!isNotStarted || !task.isBuildable || !isDevelopment(task.department)) return false;
	const goal = goalOfTask(task, board);
	if (goal?.horizon === longTermGoalHorizon) return false;
	return !isWaitingForAnotherTask(task, board);
}

function isWaitingForAnotherTask(task: BoardTask, board: AgendaBoard): boolean {
	if (task.waitsForTaskId === null) return false;
	const awaited = board.tasksById.get(task.waitsForTaskId);
	return awaited !== undefined && awaited.status !== doneTaskStatus;
}

function buildItem(task: BoardTask, projectNames: Map<string, string>): AgendaItem {
	return {
		key: agendaKey(agendaKinds.build, task.id),
		kind: agendaKinds.build,
		isBug: isBugTitle(task.title),
		projectId: task.projectId,
		projectName: projectNames.get(task.projectId) ?? null,
		subjectKind: subjectKinds.task,
		subjectId: task.id,
		subjectTitle: task.title,
		ask: buildAsk,
		askedById: null,
		since: task.createdAt,
		goal: null,
		taskPriority: task.priority,
		storyPoints: task.storyPoints
	};
}

function goalItem(goal: BoardGoal, projectNames: Map<string, string>): AgendaItem {
	return {
		key: agendaKey(agendaKinds.goal, goal.id),
		kind: agendaKinds.goal,
		isBug: false,
		projectId: goal.projectId,
		projectName: projectNames.get(goal.projectId) ?? null,
		subjectKind: subjectKinds.goal,
		subjectId: goal.id,
		subjectTitle: goal.title,
		ask: makeCurrentAsk,
		askedById: null,
		since: null,
		goal,
		taskPriority: null,
		storyPoints: null
	};
}
