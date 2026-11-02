import { describe, expect, it } from 'vitest';
import { objectSchema, textField } from './actionTypes';
import { recordIdRefusal } from './recordIdRefusal';

const wholeTaskId = '2a2808b1-547d-489d-bfef-3f8252615aac';
const shortenedTaskId = '2a2808b1';

const readTaskSchema = objectSchema({ taskId: textField('The task id') }, [
	'taskId'
]);
const createTaskSchema = objectSchema(
	{
		projectId: textField('The project'),
		goalId: textField('The goal'),
		title: textField('Title'),
	},
	['projectId', 'title']
);
const assigneesSchema = objectSchema(
	{ taskId: textField('The task id'), accountIds: { type: 'array' } },
	['taskId', 'accountIds']
);
const nextBuildableSchema = objectSchema(
	{ modelId: textField('Your build model id') },
	['modelId']
);

describe('recordIdRefusal', () => {
	it('refuses the first part of an id and names the field and the value', () => {
		const refusal = recordIdRefusal('read_task', readTaskSchema, {
			taskId: shortenedTaskId,
		});
		expect(refusal).toContain('taskId');
		expect(refusal).toContain(`"${shortenedTaskId}"`);
		expect(refusal).toContain('Nothing was done');
	});

	it('lets a whole id through', () => {
		expect(
			recordIdRefusal('read_task', readTaskSchema, { taskId: wholeTaskId })
		).toBeNull();
	});

	it('refuses an empty value for a required id', () => {
		expect(
			recordIdRefusal('read_task', readTaskSchema, { taskId: '' })
		).toContain('taskId');
	});

	it('reads an empty optional id as left out', () => {
		const input = {
			projectId: wholeTaskId,
			goalId: '',
			title: 'FIX: something',
		};
		expect(recordIdRefusal('create_task', createTaskSchema, input)).toBeNull();
	});

	it('checks every id in a list', () => {
		const input = {
			taskId: wholeTaskId,
			accountIds: [wholeTaskId, shortenedTaskId],
		};
		const refusal = recordIdRefusal(
			'set_task_assignees',
			assigneesSchema,
			input
		);
		expect(refusal).toContain('accountIds');
		expect(refusal).toContain(`"${shortenedTaskId}"`);
	});

	it('leaves a build model id alone, since it names no record', () => {
		expect(
			recordIdRefusal('next_buildable_task', nextBuildableSchema, {
				modelId: 'qwen-local',
			})
		).toBeNull();
	});
});
