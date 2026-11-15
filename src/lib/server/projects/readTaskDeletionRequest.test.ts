import { describe, expect, it } from 'vitest';
import { readTaskDeletionRequest } from './readTaskDeletionRequest';
import { taskDeletionInputs } from '$lib/data/taskDeletion';

const { keepFinishedUnderTitle, deleteOpenSubtasks } = taskDeletionInputs;

function formWith(fields: Record<string, string>): FormData {
	const formData = new FormData();
	for (const [name, value] of Object.entries(fields)) formData.set(name, value);
	return formData;
}

describe('reading the Delete task form', () => {
	it('decides nothing when the form carries neither choice', () => {
		const nothingDecided = { completedParentTitle: null, shouldDeleteOpenSubtasks: false, deletedByAccountId: 'me' };
		expect(readTaskDeletionRequest(formWith({}), 'me')).toEqual(nothingDecided);
	});

	it('takes the name typed for the completed task, without the space around it', () => {
		const request = readTaskDeletionRequest(formWith({ [keepFinishedUnderTitle]: '  Rods shipped ' }), 'me');
		expect(request.completedParentTitle).toBe('Rods shipped');
	});

	it('counts a name of nothing but spaces as no name', () => {
		const request = readTaskDeletionRequest(formWith({ [keepFinishedUnderTitle]: '   ' }), 'me');
		expect(request.completedParentTitle).toBeNull();
	});

	it('lets the open subtasks go only on a plain yes', () => {
		const yes = readTaskDeletionRequest(formWith({ [deleteOpenSubtasks]: 'true' }), 'me');
		const anythingElse = readTaskDeletionRequest(formWith({ [deleteOpenSubtasks]: 'on' }), 'me');
		expect(yes.shouldDeleteOpenSubtasks).toBe(true);
		expect(anythingElse.shouldDeleteOpenSubtasks).toBe(false);
	});
});
