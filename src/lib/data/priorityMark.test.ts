import { describe, expect, it } from 'vitest';
import {
	priorityMarkSentence,
	priorityMarkTag,
	readPriorityMarkFromForm,
	readPriorityMarkFromInput
} from './priorityMark';

describe('the priority mark', () => {
	it('is read from a form only as the word true or false', () => {
		expect(readPriorityMarkFromForm('true')).toBe(true);
		expect(readPriorityMarkFromForm('false')).toBe(false);
		expect(readPriorityMarkFromForm('yes')).toBeUndefined();
		expect(readPriorityMarkFromForm(null)).toBeUndefined();
	});

	it('is read from the connector only as a true or false', () => {
		expect(readPriorityMarkFromInput(true)).toBe(true);
		expect(readPriorityMarkFromInput(false)).toBe(false);
		expect(readPriorityMarkFromInput('true')).toBeUndefined();
		expect(readPriorityMarkFromInput(undefined)).toBeUndefined();
	});

	it('tags a marked task in a reading and leaves an unmarked one bare', () => {
		expect(priorityMarkTag(true)).toBe(' [priority]');
		expect(priorityMarkTag(false)).toBe('');
	});

	it('says where a marked task now sits', () => {
		expect(priorityMarkSentence('Fix the export', true)).toContain('sits first');
		expect(priorityMarkSentence('Fix the export', false)).toContain('keeps its place');
	});
});
