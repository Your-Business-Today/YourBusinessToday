import { describe, expect, it } from 'vitest';
import { todoStatuses } from '$lib/data/todo';
import { describeTodos, noTodos } from './describeTodos';
import { taskTodoLines } from './describeTaskTodos';
import type { Todo } from '$lib/server/todos/todoRecord';

const jeremy = 'jeremy-account';

const insurance: Todo = {
	id: 'todo-1',
	ownerAccountId: jeremy,
	projectId: 'ybt',
	taskId: 'site-task',
	taskTitle: 'Get the website presentable',
	projectName: 'YourBusinessToday',
	title: 'Put insurance in place',
	notes: null,
	status: todoStatuses.toDo,
	dueDate: '2026-11-07',
	createdBy: jeremy,
	createdAt: '2026-10-31T08:00:00Z',
	completedAt: null
};

describe('to-dos as the connector reads them', () => {
	it('names the task each serves and its id', () => {
		const [line] = describeTodos([insurance]);
		expect(line).toContain('Put insurance in place — To do, due 7 Nov 2026');
		expect(line).toContain('for "Get the website presentable" on YourBusinessToday (task id: site-task)');
		expect(line).toContain('(to-do id: todo-1)');
	});

	it('says so when there are none', () => {
		expect(describeTodos([])).toEqual([noTodos]);
	});

	it('lists a task’s to-dos with whose each is, or that anyone may take it', () => {
		const people = [{ id: jeremy, name: 'Jeremy', email: 'j@example.com' }];
		const untaken = { ...insurance, id: 'todo-2', ownerAccountId: null };
		const lines = taskTodoLines([insurance, untaken], people as never);
		expect(lines[0]).toContain('never hold it up');
		expect(lines[1]).toContain('Jeremy, To do');
		expect(lines[2]).toContain('anyone on the project');
	});
});
