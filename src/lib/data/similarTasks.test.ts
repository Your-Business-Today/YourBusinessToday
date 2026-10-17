import { describe, expect, it } from 'vitest';
import { readSimilarTasks } from './similarTasks';

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
