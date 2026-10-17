import { describe, expect, it } from 'vitest';
import { choiceForSetting, isTaskAutocomplete, validateAutocompleteChoice } from './autocomplete';

describe('isTaskAutocomplete', () => {
	it('follows the goal when the task has no setting of its own', () => {
		expect(isTaskAutocomplete(null, false)).toBe(false);
	});

	it('lets the task setting win over its goal', () => {
		expect(isTaskAutocomplete(true, false)).toBe(true);
	});

	it('is on for a task with no setting and no goal', () => {
		expect(isTaskAutocomplete(null, null)).toBe(true);
	});
});

describe('validateAutocompleteChoice', () => {
	it('reads follow_goal as no setting of its own', () => {
		expect(validateAutocompleteChoice('follow_goal')).toBeNull();
	});

	it('refuses a choice that is not one of the three', () => {
		expect(validateAutocompleteChoice('maybe')).toBeUndefined();
	});

	it('round-trips a setting through its choice', () => {
		expect(validateAutocompleteChoice(choiceForSetting(false))).toBe(false);
	});
});
