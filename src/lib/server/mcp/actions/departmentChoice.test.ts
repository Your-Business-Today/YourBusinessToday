import { describe, expect, it } from 'vitest';
import { isDepartmentRefused, readDepartment } from './departmentChoice';
import { departmentRefusal } from '$lib/data/department';

describe('readDepartment', () => {
	it('reads a named department as that department, never as a refusal', () => {
		const department = readDepartment({ department: 'Administration' });
		expect(isDepartmentRefused(department)).toBe(false);
		expect(department).toBe('administration');
	});

	it('leaves the department unset when none is named', () => {
		expect(readDepartment({})).toBeUndefined();
	});

	it('refuses a value that names no department', () => {
		const department = readDepartment({ department: 'finance' });
		expect(isDepartmentRefused(department)).toBe(true);
		expect(department).toEqual({ refusal: departmentRefusal });
	});
});
