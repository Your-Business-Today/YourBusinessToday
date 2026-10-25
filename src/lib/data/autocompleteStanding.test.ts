import { describe, expect, it } from 'vitest';
import {
	canChooseTaskAutocomplete,
	canSwitchGoalAutocomplete,
	withRaiserAutocomplete
} from './autocompleteStanding';

const isStaff = true;
const isNotStaff = false;
const unsetSeed: { autocomplete?: boolean | null } = {};

describe('canChooseTaskAutocomplete', () => {
	it('lets anyone turn a task off', () => {
		expect(canChooseTaskAutocomplete(false, isNotStaff)).toBe(true);
	});

	it('keeps turning a task on for staff', () => {
		expect(canChooseTaskAutocomplete(true, isNotStaff)).toBe(false);
		expect(canChooseTaskAutocomplete(true, isStaff)).toBe(true);
	});

	it('keeps handing a task back to its goal for staff', () => {
		expect(canChooseTaskAutocomplete(null, isNotStaff)).toBe(false);
		expect(canChooseTaskAutocomplete(null, isStaff)).toBe(true);
	});
});

describe('canSwitchGoalAutocomplete', () => {
	it('lets anyone turn a goal off and only staff turn it on', () => {
		expect(canSwitchGoalAutocomplete(false, isNotStaff)).toBe(true);
		expect(canSwitchGoalAutocomplete(true, isNotStaff)).toBe(false);
		expect(canSwitchGoalAutocomplete(true, isStaff)).toBe(true);
	});
});

describe('withRaiserAutocomplete', () => {
	it('starts a task raised by someone who is not staff off', () => {
		expect(withRaiserAutocomplete({ autocomplete: true }, isNotStaff).autocomplete).toBe(false);
		expect(withRaiserAutocomplete(unsetSeed, isNotStaff).autocomplete).toBe(false);
	});

	it('keeps the setting a staff member raised it with', () => {
		expect(withRaiserAutocomplete({ autocomplete: true }, isStaff).autocomplete).toBe(true);
		expect(withRaiserAutocomplete(unsetSeed, isStaff).autocomplete).toBeUndefined();
	});
});
