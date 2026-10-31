import { describe, expect, it } from 'vitest';
import { todoLimits } from './todo';
import { validateTodoChanges } from './validateTodo';

describe('a to-do checked against its columns', () => {
	it('takes the fields it is given and leaves the rest alone', () => {
		const changes = validateTodoChanges({ title: ' Put insurance in place ', dueDate: '2026-11-07' });
		expect(changes).toEqual({ title: 'Put insurance in place', dueDate: '2026-11-07' });
	});

	it('refuses a title that is empty or too long, by name', () => {
		expect(validateTodoChanges({ title: '' })).toContain('title');
		expect(validateTodoChanges({ title: 'x'.repeat(todoLimits.longestTitle + 1) })).toContain('title');
	});

	it('refuses a status or a day the table cannot hold', () => {
		expect(validateTodoChanges({ status: 'blocked' })).toContain('status');
		expect(validateTodoChanges({ dueDate: '2026-02-30' })).toContain('YYYY-MM-DD');
		expect(validateTodoChanges({ dueDate: '7 Nov' })).toContain('YYYY-MM-DD');
	});

	it('clears notes and a due date given as nothing', () => {
		expect(validateTodoChanges({ notes: '', dueDate: '' })).toEqual({ notes: null, dueDate: null });
	});
});
