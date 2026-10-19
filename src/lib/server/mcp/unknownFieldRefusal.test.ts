import { describe, expect, it } from 'vitest';
import { objectSchema, textField } from './actionTypes';
import { unknownFieldRefusal } from './unknownFieldRefusal';

const findTasksSchema = objectSchema(
	{
		projectId: textField('The project id'),
		words: textField('A few words from the task you have in mind')
	},
	['projectId']
);

describe('unknownFieldRefusal', () => {
	it('refuses a field the action does not take and names the ones it does', () => {
		const input = { projectId: 'p1', query: 'Ravenswood' };
		const refusal = unknownFieldRefusal('find_tasks', findTasksSchema, input);
		expect(refusal).toContain('find_tasks has no field called query');
		expect(refusal).toContain('- words: A few words from the task you have in mind');
	});

	it('lets through an input whose every field is known', () => {
		const input = { projectId: 'p1', words: 'Ravenswood' };
		expect(unknownFieldRefusal('find_tasks', findTasksSchema, input)).toBeNull();
	});

	it('says when the action takes no input at all', () => {
		const refusal = unknownFieldRefusal('list_waiting_on_me', objectSchema({}), { all: true });
		expect(refusal).toContain('It takes no input');
	});
});
