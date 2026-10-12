import { describe, expect, it } from 'vitest';
import { taskMovedSentence, taskMoveWarnings } from './taskMove';

const betweenProjects = { sourceProjectName: 'Carp Mania', destinationProjectName: 'Cod Mania' };

describe('taskMovedSentence', () => {
	it('records where the task came from and where it went', () => {
		expect(taskMovedSentence({ ...betweenProjects, wasGoalLinked: false })).toBe(
			'Moved to Cod Mania, from Carp Mania.'
		);
	});

	it('records the goal link only when there was one to clear', () => {
		expect(taskMovedSentence({ ...betweenProjects, wasGoalLinked: true })).toContain('goal link');
	});
});

describe('taskMoveWarnings', () => {
	it('warns about the goal link and the assignees before anything is confirmed', () => {
		expect(taskMoveWarnings.some((warning) => warning.includes('goal link'))).toBe(true);
		expect(taskMoveWarnings.some((warning) => warning.includes('assignee'))).toBe(true);
	});
});
