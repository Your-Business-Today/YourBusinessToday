import { subjectKinds, type AgendaGoal, type AgendaItem } from './agendaItem';
import type { AgendaBoard, BoardTask } from './agendaBoard';

/**
 * Each item with the goal its work counts toward, and the priority and size of its task. The goal is
 * the one it was said on, or its task's own, or its parent task's: the same rule the backlog and the
 * horizons follow. Work on no goal, a to-do of their own or someone to chase, counts as current.
 */
export function placeOnBoard(items: AgendaItem[], board: AgendaBoard): AgendaItem[] {
	return items.map((item) => {
		const task = taskOfItem(item, board);
		const goal = goalOfItem(item, task, board);
		return { ...item, goal, taskPriority: task?.priority ?? null, storyPoints: task?.storyPoints ?? null };
	});
}

function taskOfItem(item: AgendaItem, board: AgendaBoard): BoardTask | null {
	const { subjectKind, subjectId } = item;
	const isOnATask = subjectKind === subjectKinds.task && subjectId !== null;
	return isOnATask ? (board.tasksById.get(subjectId) ?? null) : null;
}

function goalOfItem(item: AgendaItem, task: BoardTask | null, board: AgendaBoard): AgendaGoal | null {
	const { subjectKind, subjectId } = item;
	const isOnAGoal = subjectKind === subjectKinds.goal && subjectId !== null;
	if (isOnAGoal) return board.goalsById.get(subjectId) ?? null;
	return task === null ? null : goalOfTask(task, board);
}

/** The goal a task counts toward: its own, else its parent's, up the tree. */
export function goalOfTask(task: BoardTask, board: AgendaBoard): AgendaGoal | null {
	const visited = new Set<string>();
	let current: BoardTask | undefined = task;
	while (current !== undefined && !visited.has(current.id)) {
		visited.add(current.id);
		const ownGoal = current.goalId === null ? undefined : board.goalsById.get(current.goalId);
		if (ownGoal !== undefined) return ownGoal;
		current = current.parentTaskId === null ? undefined : board.tasksById.get(current.parentTaskId);
	}
	return null;
}
