import { describe, expect, it } from 'vitest';
import { comparedTaskText, readSimilarTasks } from './similarTasks';

describe('readSimilarTasks', () => {
	it('finds none on an ordinary refusal', () => {
		expect(readSimilarTasks({ message: 'A task title is required.' })).toEqual([]);
		expect(readSimilarTasks(null)).toEqual([]);
	});

	it('reads the tasks a similar-task refusal carries', () => {
		const similarTasks = [{ taskId: 't', title: 'Fire door register' }];
		expect(readSimilarTasks({ message: 'x', similarTasks })).toEqual(similarTasks);
	});
});

describe('comparedTaskText', () => {
	it('is what the story wants when it has one', () => {
		expect(comparedTaskText('Export', 'the fire door register')).toBe('the fire door register');
	});

	it('is the title when the task has no story', () => {
		expect(comparedTaskText('Export the register', null)).toBe('Export the register');
		expect(comparedTaskText('Export the register', '  ')).toBe('Export the register');
	});
});
