import { describe, expect, it } from 'vitest';
import { isSomeoneElsesTask } from './askSimilarTaskRaisers';

const scarlett = { accountId: 'scarlett', postedVia: 'site' as const };
const raised = { taskId: 'new-task', title: 'Export the fire door register', projectName: 'Jewel PFP Portal', parentTaskId: null };
const stuartsTask = {
	taskId: 'task-1',
	projectId: 'project-1',
	title: 'Fire door register as a spreadsheet',
	projectName: 'Jewel PFP Portal',
	raisedById: 'stuart',
	raisedBy: 'Stuart',
	sharedWords: ['fire', 'door', 'register']
};

describe('isSomeoneElsesTask', () => {
	it('reviews a task someone else raised', () => {
		expect(isSomeoneElsesTask(stuartsTask, scarlett, raised)).toBe(true);
	});

	it('never asks the raiser about their own task or the task just raised', () => {
		expect(isSomeoneElsesTask({ ...stuartsTask, raisedById: 'scarlett' }, scarlett, raised)).toBe(false);
		expect(isSomeoneElsesTask({ ...stuartsTask, taskId: 'new-task' }, scarlett, raised)).toBe(false);
	});
});
