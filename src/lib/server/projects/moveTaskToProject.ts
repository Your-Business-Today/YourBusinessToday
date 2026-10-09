import type { SupabaseClient } from '@supabase/supabase-js';
import { compactTaskQueue, compactTaskSiblingRanks } from '$lib/server/ordering/compactInDatabase';
import { dropAssigneesOffProject } from '$lib/server/projects/dropAssigneesOffProject';
import { dropSequenceLinksAcrossProjects } from '$lib/server/projects/dropSequenceLinksAcrossProjects';
import { getTaskAndDescendantIds } from '$lib/server/projects/getTaskAndDescendantIds';
import { nextQueueRank, nextSiblingRank } from '$lib/server/projects/nextRanks';
import { postMessage } from '$lib/server/conversations/postMessage';
import { taskMovedSentence } from '$lib/data/taskMove';
import { updateTaskColumns } from '$lib/server/projects/taskSiblings';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

export type TaskMove = {
	task: ProjectTask;
	source: Project;
	destination: Project;
	movedByAccountId: string;
};

/**
 * A task changes project by leaving one backlog and joining the end of
 * another, taking its subtasks and everything hung off them with it. Two
 * things cannot cross: the goal, which belongs to the project the task was
 * raised on, and assignees the destination project has never heard of. A
 * sequence cannot span projects either, so the links between the family and
 * the tasks it leaves behind are dropped. The backlog it left closes the gap
 * behind it.
 */
export async function moveTaskToProject(supabase: SupabaseClient, move: TaskMove): Promise<void> {
	const { task, source, destination } = move;
	const familyIds = await getTaskAndDescendantIds(supabase, task.id);
	const backlogRank = await nextSiblingRank(supabase, destination.id, null);
	const queueRank = await queueRankFor(supabase, move);
	await dropSequenceLinksAcrossProjects(supabase, familyIds);
	await carryFamilyAcross(supabase, familyIds, destination.id);
	await updateTaskColumns(supabase, task.id, {
		parent_task_id: null,
		priority: backlogRank,
		global_priority: queueRank
	});
	await dropAssigneesOffProject(supabase, familyIds, destination.id);
	await compactTaskSiblingRanks(supabase, source.id);
	await compactTaskQueue(supabase, source.ownerId);
	await postMessage(supabase, { taskId: task.id }, move.movedByAccountId, sentenceFor(move));
}

/** The queue is one owner's. Stay in the same owner's hands and the place is kept. */
async function queueRankFor(supabase: SupabaseClient, move: TaskMove): Promise<number> {
	const { task, source, destination } = move;
	if (task.globalPriority !== null && source.ownerId === destination.ownerId) {
		return task.globalPriority;
	}
	return nextQueueRank(supabase, destination.id);
}

async function carryFamilyAcross(
	supabase: SupabaseClient,
	familyIds: string[],
	destinationProjectId: string
): Promise<void> {
	const { error } = await supabase
		.from('tasks')
		.update({ project_id: destinationProjectId, goal_id: null })
		.in('id', familyIds);
	if (error) throw error;
}

function sentenceFor({ task, source, destination }: TaskMove): string {
	return taskMovedSentence({
		sourceProjectName: source.name,
		destinationProjectName: destination.name,
		hadGoal: task.goalId !== null
	});
}
