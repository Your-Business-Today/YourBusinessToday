import { fibonacciStoryPoints } from '$lib/data/storyPoints';
import { parseCompletionPercent } from '$lib/data/completionClamp';
import { parseTaskKind } from '$lib/data/taskKind';
import { parseDepartment } from '$lib/data/department';
import { readOptionalText } from '../actionTypes';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import type { TaskDetailsUpdate } from '$lib/server/projects/updateTaskDetails';

export const wrongStoryPoints =
	`Story points go ${fibonacciStoryPoints.join(', ')}. Pick the nearest one.`;

export function readTaskDetailsEdit(
	input: Record<string, unknown>,
	task: ProjectTask
): TaskDetailsUpdate | null {
	const storyPoints = readStoryPoints(input, task);
	if (storyPoints === null) return null;
	return {
		...task,
		title: readOptionalText(input, 'title') ?? task.title,
		details: readOptionalText(input, 'details') ?? task.details,
		dueDate: readOptionalText(input, 'dueDate') ?? task.dueDate,
		goalId: readOptionalText(input, 'goalId') ?? task.goalId,
		kind: readKind(input, task),
		department: parseDepartment(input.department) ?? task.department,
		storyPoints,
		completionPercent: readCompletionPercent(input, task)
	};
}

function readStoryPoints(input: Record<string, unknown>, task: ProjectTask): number | null {
	const chosen = input.storyPoints;
	if (chosen === undefined || chosen === null) return task.storyPoints;
	return fibonacciStoryPoints.find((points) => points === Number(chosen)) ?? null;
}

function readCompletionPercent(input: Record<string, unknown>, task: ProjectTask): number {
	const chosen = input.completionPercent;
	if (chosen === undefined || chosen === null) return task.completionPercent;
	return parseCompletionPercent(chosen);
}

function readKind(input: Record<string, unknown>, task: ProjectTask): ProjectTask['kind'] {
	const chosen = readOptionalText(input, 'kind');
	if (chosen === null) return task.kind;
	return parseTaskKind(chosen);
}
