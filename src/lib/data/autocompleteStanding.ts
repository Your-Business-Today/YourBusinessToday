import type { AutocompleteSetting } from './autocomplete';
import { defaultDepartment, isDevelopment, type Department } from './department';

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

/** Only a development task is built, so only a development task may be autocomplete or follow a goal that is. */
export function canDepartmentAutocomplete(setting: AutocompleteSetting, department: Department): boolean {
	return isDevelopment(department) || setting === nonStaffAutocomplete;
}

type RaisedTask = { autocomplete?: AutocompleteSetting; department?: Department };

/**
 * A task raised by someone who is not staff starts off, set on the task, whatever it would have followed;
 * so does an infrastructure, administration, sales or marketing task, which a person does and nothing builds.
 */
export function withRaiserAutocomplete<Seed extends RaisedTask>(seed: Seed, isStaff: boolean): Seed {
	const isBuilt = isDevelopment(seed.department ?? defaultDepartment);
	if (isStaff && isBuilt) return seed;
	return { ...seed, autocomplete: nonStaffAutocomplete };
}
