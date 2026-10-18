import { describe, expect, it } from 'vitest';
import { similarTasksAnswer } from './similarTaskCheck';

const stuartsTask = {
	taskId: 'task-1',
	projectId: 'project-1',
	title: 'Fire door register as a spreadsheet',
	raisedBy: 'Stuart',
	sharedWords: ['fire', 'door', 'register']
};

describe('similarTasksAnswer', () => {
	it('names the project, each open task and who raised it, and how to raise anyway', () => {
		const answer = similarTasksAnswer('Export the fire door register', 'Jewel PFP Portal', [stuartsTask]);
		expect(answer).toContain('looks like 1 open task(s) on Jewel PFP Portal');
		expect(answer).toContain('"Fire door register as a spreadsheet", raised by Stuart');
		expect(answer).toContain('raiseAnyway: true');
	});
});
