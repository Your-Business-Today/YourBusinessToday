import { describe, expect, it } from 'vitest';
import { readProgress } from './progressField';
import { taskStatuses } from '$lib/data/taskStatus';

describe('the progress a message reports', () => {
	it('moves the task to In progress when started and to Done when finished', () => {
		expect(readProgress({ progress: 'started' })).toBe(taskStatuses.inProgress);
		expect(readProgress({ progress: 'finished' })).toBe(taskStatuses.done);
	});

	it('reports nothing when left out, and is refused when it is not a word it takes', () => {
		expect(readProgress({})).toBeNull();
		expect(readProgress({ progress: 'half done' })).toBeUndefined();
	});
});
