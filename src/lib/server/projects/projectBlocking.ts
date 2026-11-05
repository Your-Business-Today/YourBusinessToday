import { isTaskDone } from '$lib/data/taskStatus';
import type { ConversationTurn } from '$lib/data/conversationTurn';
import type { ProjectTask } from './taskRecord';

/** One person a project waits on: how many of its open tasks wait on them, and since when the longest has. */
export type PersonBlocking = { accountId: string; taskIds: string[]; oldestSince: string };

type BlockingSources = { tasks: ProjectTask[]; turnsByTask: Map<string, ConversationTurn> };

/** Everyone an open task on the project waits on, most tasks first. */
export function blockingPeopleOf({ tasks, turnsByTask }: BlockingSources): PersonBlocking[] {
	const byPerson = new Map<string, PersonBlocking>();
	for (const task of tasks.filter((openTask) => !isTaskDone(openTask.status))) {
		const turn = turnsByTask.get(task.id);
		const awaiting = turn?.awaiting ?? null;
		if (turn === undefined || awaiting === null) continue;
		const { accountId } = awaiting;
		byPerson.set(accountId, withTask(byPerson.get(accountId), accountId, task.id, turn.since));
	}
	return [...byPerson.values()].sort((left, right) => taskCountOf(right) - taskCountOf(left));
}

function taskCountOf({ taskIds }: PersonBlocking): number {
	return taskIds.length;
}

function withTask(blocking: PersonBlocking | undefined, accountId: string, taskId: string, since: string): PersonBlocking {
	if (blocking === undefined) return { accountId, taskIds: [taskId], oldestSince: since };
	const oldestSince = since < blocking.oldestSince ? since : blocking.oldestSince;
	return { accountId, taskIds: [...blocking.taskIds, taskId], oldestSince };
}
