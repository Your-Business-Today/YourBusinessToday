import type { RegisterGoal, RegisterProject, RegisterTask } from './autocompleteRegister';

export type AutocompleteRegisterFilter = 'on' | 'off' | 'all';

export const autocompleteRegisterFilterLabels: Record<AutocompleteRegisterFilter, string> = {
	on: 'Autocomplete on',
	off: 'Autocomplete off',
	all: 'All'
};

export const autocompleteRegisterFilterOrder: AutocompleteRegisterFilter[] = ['on', 'off', 'all'];

export const filterWhenAutocompleteOn: AutocompleteRegisterFilter = 'on';
export const filterWhenAutocompleteOff: AutocompleteRegisterFilter = 'off';
export const filterForEveryEntry: AutocompleteRegisterFilter = 'all';

const autocompleteRegisterPath = '/projects/autocomplete';

export function parseAutocompleteRegisterFilter(value: string | null): AutocompleteRegisterFilter {
	const knownFilter = autocompleteRegisterFilterOrder.find((filter) => filter === value);
	return knownFilter ?? filterWhenAutocompleteOn;
}

export function autocompleteRegisterHref(filter: AutocompleteRegisterFilter): string {
	if (filter === filterWhenAutocompleteOn) return autocompleteRegisterPath;
	return `${autocompleteRegisterPath}?autocomplete=${filter}`;
}

export function matchesAutocompleteFilter(
	isAutocomplete: boolean,
	filter: AutocompleteRegisterFilter
): boolean {
	if (filter === filterForEveryEntry) return true;
	const isOnWanted = filter === filterWhenAutocompleteOn;
	return isAutocomplete === isOnWanted;
}

export function goalsShown(project: RegisterProject, filter: AutocompleteRegisterFilter): RegisterGoal[] {
	return project.goals.filter((goal) => matchesAutocompleteFilter(goal.isAutocomplete, filter));
}

export function ownSettingTasksShown(
	project: RegisterProject,
	filter: AutocompleteRegisterFilter
): RegisterTask[] {
	const ownSettingTasks = project.tasks.filter((task) => task.setting !== null);
	return ownSettingTasks.filter((task) => matchesAutocompleteFilter(task.isAutocomplete, filter));
}

export function hasEntriesShown(project: RegisterProject, filter: AutocompleteRegisterFilter): boolean {
	if (filter === filterForEveryEntry) return true;
	const entryCount = goalsShown(project, filter).length + ownSettingTasksShown(project, filter).length;
	return entryCount > 0;
}
