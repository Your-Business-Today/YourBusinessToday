import { describe, expect, it } from 'vitest';
import { comparedTaskTexts, readSimilarTasks } from './similarTasks';

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

describe('comparedTaskTexts', () => {
	it('is the title and what the story wants when it has one', () => {
		expect(comparedTaskTexts('Export', 'the fire door register')).toEqual(['Export', 'the fire door register']);
	});

	it('is the title alone when the task has no story', () => {
		expect(comparedTaskTexts('Export the register', null)).toEqual(['Export the register']);
		expect(comparedTaskTexts('Export the register', '  ')).toEqual(['Export the register']);
	});

	it('compares a bug fix by what is wrong, not by its FIX prefix', () => {
		expect(comparedTaskTexts('FIX: invoice total is rounded up', null)).toEqual(['invoice total is rounded up']);
	});
});
