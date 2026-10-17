import type { AutocompleteSetting } from '$lib/data/autocomplete';

export type RegisterTask = {
	id: string;
	title: string;
	goalId: string | null;
	setting: AutocompleteSetting;
	isAutocomplete: boolean;
};

export type RegisterGoal = { id: string; title: string; isAutocomplete: boolean };

/** One project's part of the autocomplete register: its open goals and open tasks, each on or off. */
export type RegisterProject = {
	id: string;
	name: string;
	goals: RegisterGoal[];
	tasks: RegisterTask[];
};

export function countOpenTasks(project: RegisterProject): number {
	const { tasks } = project;
	return tasks.length;
}

export function countAutocomplete(project: RegisterProject): number {
	return project.tasks.filter((task) => task.isAutocomplete).length;
}
