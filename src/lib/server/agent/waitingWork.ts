import { agendaKinds, type AgendaItem } from './agendaItem';
import { getTasksWaitingOnOthers } from './tasksWaitingOnOthers';
import { isWaitingForAnotherTask } from './boardItems';
import type { AgendaBoard } from './agendaBoard';
import type { SupabaseClient } from '@supabase/supabase-js';

const taskWorkKinds: string[] = [agendaKinds.task, agendaKinds.build];

/**
 * The agenda without work that waits on someone else: a task, or work to build, whose thread holds a
 * question open for another person, or that follows a task not yet done. A question put to the person
 * themselves always stays.
 */
export async function withoutWaitingWork(
	supabase: SupabaseClient,
	items: AgendaItem[],
	board: AgendaBoard,
	personAccountIds: string[]
): Promise<AgendaItem[]> {
	const taskIds = items.filter(isTaskWork).flatMap((item) => item.subjectId ?? []);
	const waitingOnOthers = await getTasksWaitingOnOthers(supabase, taskIds, personAccountIds);
	return items.filter((item) => !isTaskWork(item) || !isWaiting(item, board, waitingOnOthers));
}

function isTaskWork(item: AgendaItem): boolean {
	return taskWorkKinds.includes(item.kind) && item.subjectId !== null;
}

function isWaiting(item: AgendaItem, board: AgendaBoard, waitingOnOthers: Set<string>): boolean {
	const taskId = item.subjectId ?? '';
	if (waitingOnOthers.has(taskId)) return true;
	const task = board.tasksById.get(taskId);
	return task !== undefined && isWaitingForAnotherTask(task, board);
}
