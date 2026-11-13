import { describe, expect, it } from 'vitest';
import { validateNewProjectFields } from './newProjectFields';

describe('validateNewProjectFields', () => {
	it('accepts text in every field it is given, and fields left out', () => {
		expect(validateNewProjectFields({ name: 'Harbour site', repositoryUrl: 'https://github.com/harbour/site' })).toBeNull();
	});

	it('refuses a field that is not text, naming it', () => {
		expect(validateNewProjectFields({ name: 'Harbour site', description: 42 })).toBe('The description is text.');
	});

	it('refuses a NUL character rather than storing it', () => {
		expect(validateNewProjectFields({ name: 'Harbour\u0000site' })).toBe('The name cannot contain a NUL character.');
	});
});
