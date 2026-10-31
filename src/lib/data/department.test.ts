import { describe, expect, it } from 'vitest';
import { departments, isDevelopment, parseDepartment, readStoredDepartment } from './department';

describe('departments', () => {
	it('reads a named department whatever its case', () => {
		expect(parseDepartment(' Sales ')).toBe(departments.sales);
		expect(parseDepartment('finance')).toBeNull();
		expect(parseDepartment('Infrastructure')).toBe(departments.infrastructure);
	});

	it('reads a stored department as development when it is missing', () => {
		expect(readStoredDepartment(undefined)).toBe(departments.development);
		expect(readStoredDepartment('marketing')).toBe(departments.marketing);
	});

	it('knows development from the business departments', () => {
		expect(isDevelopment(departments.development)).toBe(true);
		expect(isDevelopment(departments.administration)).toBe(false);
		expect(isDevelopment(departments.infrastructure)).toBe(false);
	});
});
