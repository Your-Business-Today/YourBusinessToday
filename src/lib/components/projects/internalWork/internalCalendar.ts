import { isPastDue } from '$lib/data/dueDate';
import { isTaskDone } from '$lib/data/taskStatus';
import { isTodoOpen } from '$lib/data/todo';
import type { InternalItem } from './internalWorkGroups';
import type { TaskSheetTarget } from '$lib/client/taskSheet.svelte';
import type { Todo } from '$lib/server/todos/todoRecord';

/** An item or a to-do as the calendar places it. A to-do opens the item it belongs to. */
export type CalendarEntry = {
	id: string;
	title: string;
	dueDate: string | null;
	isTodo: boolean;
	isFinished: boolean;
	isOverdue: boolean;
	opens: TaskSheetTarget;
};

export type InternalCalendar = { entriesByDay: Map<string, CalendarEntry[]>; undatedEntries: CalendarEntry[] };

/** Every internal item and its to-dos, placed on the day each is due, and those with no due date set apart. */
export function internalCalendarOf(items: InternalItem[], todosByTask: Record<string, Todo[]>, now: Date = new Date()): InternalCalendar {
	const entries = items.flatMap((item) => entriesOfItem(item, todosByTask[item.id] ?? [], now));
	return {
		entriesByDay: entriesByDueDay(entries),
		undatedEntries: entries.filter((entry) => entry.dueDate === null)
	};
}

function entriesOfItem({ task }: InternalItem, todos: Todo[], now: Date): CalendarEntry[] {
	const opens = { projectId: task.projectId, taskId: task.id };
	const isFinished = isTaskDone(task.status);
	const itemEntry = {
		id: task.id,
		title: task.title,
		dueDate: task.dueDate,
		isTodo: false,
		isFinished,
		isOverdue: isPastDue(task.dueDate, isFinished, now),
		opens
	};
	return [itemEntry, ...todos.map((todo) => todoEntry(todo, opens, now))];
}

function todoEntry(todo: Todo, opens: TaskSheetTarget, now: Date): CalendarEntry {
	const isFinished = !isTodoOpen(todo.status);
	return {
		id: todo.id,
		title: todo.title,
		dueDate: todo.dueDate,
		isTodo: true,
		isFinished,
		isOverdue: isPastDue(todo.dueDate, isFinished, now),
		opens
	};
}

function entriesByDueDay(entries: CalendarEntry[]): Map<string, CalendarEntry[]> {
	const days = new Map<string, CalendarEntry[]>();
	for (const entry of entries) {
		if (entry.dueDate === null) continue;
		days.set(entry.dueDate, [...(days.get(entry.dueDate) ?? []), entry]);
	}
	return days;
}
