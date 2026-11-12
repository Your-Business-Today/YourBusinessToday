import { describe, expect, it } from 'vitest';
import { internalCalendarOf } from './internalCalendar';
import { statusBoardColumnsOf } from './statusBoardColumns';
import type { InternalItem } from './internalWorkGroups';
import type { TaskStatus } from '$lib/data/taskStatus';
import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';
import type { Todo } from '$lib/server/todos/todoRecord';

function itemDue(id: string, status: TaskStatus, dueDate: string | null): InternalItem {
	const task = { id, projectId: 'project', title: id, status, dueDate, subtasks: [] } as unknown as TaskTreeNode;
	return { id, task, depth: 0, place: { position: 1, count: 1, shownIds: id } };
}

function todoDue(id: string, dueDate: string | null, status: Todo['status'] = 'to_do'): Todo {
	return { id, title: id, dueDate, status } as Todo;
}

describe('the Internal work calendar', () => {
	const now = new Date('2026-11-11T12:00:00Z');
	const insurance = itemDue('insurance', 'in_progress', '2026-11-10');
	const accounts = itemDue('accounts', 'done', '2026-11-10');
	const listing = itemDue('listing', 'backlog', null);
	const todosByTask = { insurance: [todoDue('quote', '2026-11-20'), todoDue('call', null, 'done')] };
	const calendar = internalCalendarOf([insurance, accounts, listing], todosByTask, now);

	it('places items and to-dos on the day they are due', () => {
		expect(calendar.entriesByDay.get('2026-11-10')?.map((entry) => entry.id)).toEqual(['insurance', 'accounts']);
		expect(calendar.entriesByDay.get('2026-11-20')?.map((entry) => entry.id)).toEqual(['quote']);
	});

	it('marks only unfinished work whose day has passed as overdue', () => {
		const [late, finished] = calendar.entriesByDay.get('2026-11-10') ?? [];
		expect(late.isOverdue).toBe(true);
		expect(finished.isOverdue).toBe(false);
	});

	it('lists what has no due date apart, a to-do opening the item it belongs to', () => {
		expect(calendar.undatedEntries.map((entry) => entry.id)).toEqual(['call', 'listing']);
		expect(calendar.undatedEntries[0].opens).toEqual({ projectId: 'project', taskId: 'insurance' });
	});
});

describe('the Internal work status board', () => {
	it('has the four monday.com columns in order, each holding the items at its status', () => {
		const columns = statusBoardColumnsOf([itemDue('a', 'on_hold', null), itemDue('b', 'backlog', null)]);
		expect(columns.map((column) => column.label)).toEqual(['Not started', 'Working on it', 'Stuck', 'Done']);
		expect(columns[2].items.map((item) => item.id)).toEqual(['a']);
	});
});
