import { describe, expect, it } from 'vitest';
import { parseTaskListFilter, taskListHref } from './taskListFilter';

describe('taskListFilter', () => {
	it('falls back to the open queue for anything unknown', () => {
		expect(parseTaskListFilter(null)).toBe('open');
		expect(parseTaskListFilter('everything')).toBe('open');
		expect(parseTaskListFilter('team')).toBe('open');
		expect(parseTaskListFilter('assigned')).toBe('assigned');
	});

	it('keeps the open queue at the bare path', () => {
		expect(taskListHref('open')).toBe('/tasks');
		expect(taskListHref('assigned')).toBe('/tasks?status=assigned');
	});
});
