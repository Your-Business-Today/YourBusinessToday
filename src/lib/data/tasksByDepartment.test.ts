import { describe, expect, it } from 'vitest';
import { tasksByDepartment } from './tasksByDepartment';
import { departments } from './department';

describe('a person’s tasks by department', () => {
	it('groups them development first and leaves out empty departments', () => {
		const insurance = { id: 'insurance', department: departments.administration };
		const website = { id: 'website', department: departments.development };
		const groups = tasksByDepartment([insurance, website]);
		expect(groups.map((group) => group.label)).toEqual(['Development', 'Administration']);
		expect(groups[1].tasks).toEqual([insurance]);
	});
});
