import type { AutocompleteSetting } from './autocomplete';

export const staffOnlyAutocompleteRefusal =
	'Only Your Business Today staff can turn autocomplete on; anyone can turn it off.';

const nonStaffAutocomplete: AutocompleteSetting = false;

/**
 * Anyone may turn a task's autocomplete off. Turning it on, or handing it back to a goal that may be
 * on, is for staff alone.
 */
export function canChooseTaskAutocomplete(setting: AutocompleteSetting, isStaff: boolean): boolean {
	return isStaff || setting === nonStaffAutocomplete;
}

export function canSwitchGoalAutocomplete(isAutocomplete: boolean, isStaff: boolean): boolean {
	return isStaff || !isAutocomplete;
}

type RaisedTask = { autocomplete?: AutocompleteSetting };

/** A task raised by someone who is not staff starts off, set on the task, whatever it would have followed. */
export function withRaiserAutocomplete<Seed extends RaisedTask>(seed: Seed, isStaff: boolean): Seed {
	if (isStaff) return seed;
	return { ...seed, autocomplete: nonStaffAutocomplete };
}
