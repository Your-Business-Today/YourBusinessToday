import { connectorTaskAutocomplete } from '$lib/data/autocomplete';
import { parseTaskKind } from '$lib/data/taskKind';
import { readOptionalText, readText } from '../actionTypes';
import { readStory } from './storyFields';
import type { NewTaskSeed } from '$lib/server/projects/createTask';

export function readConnectorTaskSeed(
	input: Record<string, unknown>,
	title: string,
	requestedBy: string | undefined
): NewTaskSeed {
	return {
		title,
		details: readText(input, 'details'),
		dueDate: readOptionalText(input, 'dueDate'),
		parentTaskId: readOptionalText(input, 'parentTaskId'),
		waitsForTaskId: readOptionalText(input, 'waitsForTaskId'),
		goalId: readOptionalText(input, 'goalId'),
		kind: parseTaskKind(readText(input, 'kind')),
		story: readStory(input),
		requestedBy,
		autocomplete: connectorTaskAutocomplete
	};
}
