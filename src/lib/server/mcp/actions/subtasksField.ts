import { proseField, readOptionalText, readText, textField } from '../actionTypes';
import type { SubtaskSeed } from '$lib/server/projects/createTask';

export const mostSubtasksRaisedAtOnce = 12;

const subtaskProperties = {
	title: textField('What this chunk of the work is, in a few words'),
	details: proseField('What the chunk builds, and how anyone can tell it is done')
};

export const subtasksField = {
	type: 'array',
	description:
		`The chunks a feature is built in, 1 to ${mostSubtasksRaisedAtOnce}, raised as its subtasks in this ` +
		'order. Each shares the feature’s user story, so one session builds one chunk without the whole ' +
		'feature on its plate. Leave out for a bug, which is one FIX task, and for work one session finishes',
	items: { type: 'object', properties: subtaskProperties, required: ['title'], additionalProperties: false }
};

export const subtasksRefusal =
	`Give subtasks as a list of 1 to ${mostSubtasksRaisedAtOnce} chunks, each with a title and only ` +
	'title and details. Nothing was raised.';

export type SubtasksChoice = { subtasks: SubtaskSeed[] | undefined } | { refusal: string };

export function isSubtasksRefused(choice: SubtasksChoice): choice is { refusal: string } {
	return 'refusal' in choice;
}

/** The chunks a task is raised with, left out when none are given, refused when the list is not one this takes. */
export function validateSubtasks(input: Record<string, unknown>): SubtasksChoice {
	const listed = input.subtasks;
	if (listed === undefined) return { subtasks: undefined };
	if (!Array.isArray(listed)) return { refusal: subtasksRefusal };
	const isSized = listed.length > 0 && listed.length <= mostSubtasksRaisedAtOnce;
	const subtasks = listed.map(subtaskSeed);
	if (!isSized || subtasks.includes(null)) return { refusal: subtasksRefusal };
	return { subtasks: subtasks as SubtaskSeed[] };
}

function subtaskSeed(subtask: unknown): SubtaskSeed | null {
	if (typeof subtask !== 'object' || subtask === null) return null;
	const fields = subtask as Record<string, unknown>;
	const hasOnlyKnownFields = Object.keys(fields).every((name) => name in subtaskProperties);
	const title = readOptionalText(fields, 'title');
	if (!hasOnlyKnownFields || title === null) return null;
	return { title, details: readText(fields, 'details') };
}
