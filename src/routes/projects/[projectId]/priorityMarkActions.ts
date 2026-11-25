import { setTaskPriorityMarkAction } from '$lib/server/priorityMark/setTaskPriorityMarkAction';
import type { Actions } from './$types';

export const priorityMarkActions = {
	setPriorityMark: setTaskPriorityMarkAction
} satisfies Actions;
