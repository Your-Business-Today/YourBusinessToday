import { boardSideLabels, boardSideMeanings, boardSideOfDepartment, boardSideOrder, isInternalWork, type BoardSide } from '$lib/data/boardSide';
import { departmentTag } from '$lib/data/department';
import { isStagedNotLive, notLiveYetLabel } from '$lib/data/stagedTasks';
import { taskKindLabels, taskStatusLabelFor } from '$lib/data/taskKind';
import type { Goal } from '$lib/server/goals/goalRecord';
import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

const subtaskIndent = '  ';

/** The backlog as two sections, Development then Internal work, each in priority order with its subtasks beneath. */
export function backlogSideLines(backlog: TaskTreeNode[], goals: Goal[]): string[] {
	return boardSideOrder.flatMap((side) => sideLines(side, backlog, goals));
}

function sideLines(side: BoardSide, backlog: TaskTreeNode[], goals: Goal[]): string[] {
	const sideTasks = backlog.filter((task) => boardSideOfDepartment(task.department) === side);
	const heading = `${boardSideLabels[side]} — ${boardSideMeanings[side]}, in priority order (a subtask’s priority is its place under its parent):`;
	if (sideTasks.length === 0) return [heading, 'Nothing here yet.', ''];
	return [heading, ...sideTasks.flatMap((task) => taskLines(task, '', goals)), ''];
}

function taskLines(task: TaskTreeNode, indent: string, goals: Goal[]): string[] {
	return [
		taskLine(task, indent, goals),
		...task.subtasks.flatMap((subtask) => taskLines(subtask, `${indent}${subtaskIndent}`, goals))
	];
}

function taskLine(task: TaskTreeNode, indent: string, goals: Goal[]): string {
	const status = taskStatusLabelFor(task.kind, task.status);
	const goal = goals.find((candidate) => candidate.id === task.goalId);
	const underGoal = goal === undefined ? '' : `, under "${goal.title}"`;
	const staged = isStagedNotLive(task) ? `, ${notLiveYetLabel}` : '';
	const points = isInternalWork(task.department) ? '' : `, ${task.storyPoints} points`;
	return `${indent}${task.title}${departmentTag(task.department)} — ${taskKindLabels[task.kind]} task, ${status}${staged}${points}${underGoal} (priority ${task.priority}, id: ${task.id})`;
}
