import { boardSideLabels, boardSideMeanings, boardSideOfDepartment, boardSideOrder, boardSides, type BoardSide } from '$lib/data/boardSide';
import { departmentTag } from '$lib/data/department';
import { isStagedNotLive, notLiveYetLabel } from '$lib/data/stagedTasks';
import { taskKindLabels, taskStatusLabelFor } from '$lib/data/taskKind';
import { internalItemLines, type InternalItemFacts } from './describeInternalItems';
import { subtaskIndent, underGoalPhrase } from './backlogLineParts';
import type { Goal } from '$lib/server/goals/goalRecord';
import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

type BacklogContext = { goals: Goal[]; facts: InternalItemFacts };

/** The backlog as a section for each side shown, Development then Internal work, each in priority order with its subtasks beneath. */
export function backlogSideLines(
	backlog: TaskTreeNode[],
	goals: Goal[],
	facts: InternalItemFacts,
	shownSides: BoardSide[] = boardSideOrder
): string[] {
	return shownSides.flatMap((side) => sideLines(side, backlog, { goals, facts }));
}

function sideLines(side: BoardSide, backlog: TaskTreeNode[], context: BacklogContext): string[] {
	const sideTasks = backlog.filter((task) => boardSideOfDepartment(task.department) === side);
	const heading = `${boardSideLabels[side]} — ${boardSideMeanings[side]}, in priority order (a subtask’s priority is its place under its parent):`;
	if (sideTasks.length === 0) return [heading, 'Nothing here yet.', ''];
	return [heading, ...sideTasks.flatMap((task) => linesOnSide(side, task, context)), ''];
}

function linesOnSide(side: BoardSide, task: TaskTreeNode, context: BacklogContext): string[] {
	if (side === boardSides.internal) return internalItemLines(task, context.goals, context.facts);
	return developmentLines(task, '', context.goals);
}

function developmentLines(task: TaskTreeNode, indent: string, goals: Goal[]): string[] {
	return [
		developmentLine(task, indent, goals),
		...task.subtasks.flatMap((subtask) => developmentLines(subtask, `${indent}${subtaskIndent}`, goals))
	];
}

function developmentLine(task: TaskTreeNode, indent: string, goals: Goal[]): string {
	const status = taskStatusLabelFor(task.kind, task.status);
	const staged = isStagedNotLive(task) ? `, ${notLiveYetLabel}` : '';
	const facts = `${status}${staged}, ${task.storyPoints} points${underGoalPhrase(task.goalId, goals)}`;
	return `${indent}${task.title}${departmentTag(task.department)} — ${taskKindLabels[task.kind]} task, ${facts} (priority ${task.priority}, id: ${task.id})`;
}
