import { connectorTaskAutocomplete } from '$lib/data/autocomplete';
import { taskKinds } from '$lib/data/taskKind';
import { proseField, readOptionalText, readText, textField } from '../actionTypes';
import { readStory, storyFields } from './storyFields';
import type { NewTaskSeed } from '$lib/server/projects/createTask';

export const mostTasksRaisedWithGoal = 12;

const goalTaskProperties = {
	title: textField('What the task is called: the user story, or "FIX: <what is wrong>"'),
	details: proseField('What the task involves'),
	...storyFields
};

const goalTaskFieldNames = Object.keys(goalTaskProperties);

export const goalTasksField = {
	type: 'array',
	description: `The goal's first tasks, 1 to ${mostTasksRaisedWithGoal}, each raised under it`,
	items: {
		type: 'object',
		properties: goalTaskProperties,
		required: ['title'],
		additionalProperties: false
	}
};

export const goalTasksRefusal =
	`Give tasks as a list of 1 to ${mostTasksRaisedWithGoal} tasks, each with a title and only ` +
	`${goalTaskFieldNames.join(', ')}. Nothing was raised.`;

/** The seeds of the tasks a goal is raised with, or null when the list is not one this action takes. */
export function listedTaskSeeds(input: Record<string, unknown>): NewTaskSeed[] | null {
	const tasks = input.tasks;
	if (!Array.isArray(tasks)) return null;
	const isSized = tasks.length > 0 && tasks.length <= mostTasksRaisedWithGoal;
	if (!isSized) return null;
	const seeds = tasks.map(listedTaskSeed);
	if (seeds.includes(null)) return null;
	return seeds as NewTaskSeed[];
}

function listedTaskSeed(task: unknown): NewTaskSeed | null {
	if (typeof task !== 'object' || task === null) return null;
	const fields = task as Record<string, unknown>;
	const hasOnlyKnownFields = Object.keys(fields).every((name) => goalTaskFieldNames.includes(name));
	if (!hasOnlyKnownFields) return null;
	const title = readOptionalText(fields, 'title');
	if (title === null) return null;
	return {
		title,
		details: readText(fields, 'details'),
		dueDate: null,
		parentTaskId: null,
		waitsForTaskId: null,
		goalId: null,
		kind: taskKinds.work,
		story: readStory(fields),
		autocomplete: connectorTaskAutocomplete
	};
}
