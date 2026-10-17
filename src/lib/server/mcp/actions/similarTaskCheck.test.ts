import { describe, expect, it } from 'vitest';
import { similarTasksAnswer } from './similarTaskCheck';

const stuartsTask = {
	taskId: 'task-1',
	projectId: 'project-1',
	title: 'Fire door register as a spreadsheet',
	projectName: 'Jewel PFP Portal',
	raisedById: 'stuart',
	raisedBy: 'Stuart',
	sharedWords: ['fire', 'door', 'register']
};

describe('similarTasksAnswer', () => {
	it('names each open task, its project and who raised it, and how to raise anyway', () => {
		const answer = similarTasksAnswer('Export the fire door register', [stuartsTask]);
		expect(answer).toContain('"Fire door register as a spreadsheet" on Jewel PFP Portal, raised by Stuart');
		expect(answer).toContain('raiseAnyway: true');
	});
});
