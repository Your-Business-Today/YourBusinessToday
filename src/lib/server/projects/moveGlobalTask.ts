import type { SupabaseClient } from '@supabase/supabase-js';
import { findQueuedTask, taskQueue } from '$lib/server/projects/taskQueue';
import { placeBeside } from '$lib/server/ordering/rankedScope';
import { orderByRank } from '$lib/server/ordering/rankedSet';
import { moveDirections, type MoveDirection } from '$lib/server/ordering/rankedSet';
import { doneTaskStatus } from '$lib/data/taskStatus';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

/**
 * One step up or down the queue. Done tasks keep their positions but are
 * skipped over as neighbours unless asked for, so a step past a done task
 * lands beside the next task still to do.
 */
export async function moveGlobalTask(
	supabase: SupabaseClient,
	taskId: string,
	direction: MoveDirection,
	shouldIncludeDone: boolean
): Promise<void> {
	const queued = await findQueuedTask(supabase, taskId);
	if (queued === null) return;
	const { task, ownerId } = queued;
	const queue = taskQueue(supabase, ownerId);
	const tasksInOrder = orderByRank(await queue.load(), queue.readRank);
	const neighbour = neighbourOf(tasksInOrder, task.id, direction, shouldIncludeDone);
	if (neighbour === null) return;
	const placement = direction === 'up' ? 'before' : 'after';
	await placeBeside(queue, task.id, neighbour.id, placement);
}

function neighbourOf(
	tasksInOrder: ProjectTask[],
	taskId: string,
	direction: MoveDirection,
	shouldIncludeDone: boolean
): ProjectTask | null {
	const currentIndex = tasksInOrder.findIndex((task) => task.id === taskId);
	if (currentIndex === -1) return null;
	const step = direction === moveDirections.up ? -1 : 1;
	for (let index = currentIndex + step; index >= 0 && index < tasksInOrder.length; index += step) {
		const candidate = tasksInOrder[index];
		if (shouldIncludeDone || candidate.status !== doneTaskStatus) return candidate;
	}
	return null;
}
