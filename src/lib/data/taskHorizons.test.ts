import { describe, expect, it } from 'vitest';
import { currentWork, taskHorizons, type PlacedTask } from './taskHorizons';

const launch = { id: 'goal-launch', horizon: 'current' as const };
const someday = { id: 'goal-someday', horizon: 'long_term' as const };

function task(id: string, goalId: string | null, parentTaskId: string | null = null): PlacedTask {
	return { id, goalId, parentTaskId };
}

describe('taskHorizons', () => {
	it('puts a task on its own goal’s horizon', () => {
		const horizons = taskHorizons([task('a', 'goal-launch'), task('b', 'goal-someday')], [launch, someday]);
		expect(horizons.get('a')).toBe('current');
		expect(horizons.get('b')).toBe('long_term');
	});

	it('puts a task with no goal on the current horizon, wherever its goal went', () => {
		const horizons = taskHorizons([task('a', null), task('b', 'goal-gone')], [launch]);
		expect(horizons.get('a')).toBe('current');
		expect(horizons.get('b')).toBe('current');
	});

	it('keeps a subtask with no goal of its own on its parent’s horizon, however deep', () => {
		const tasks = [
			task('parent', 'goal-someday'),
			task('child', null, 'parent'),
			task('grandchild', null, 'child')
		];
		expect(taskHorizons(tasks, [launch, someday]).get('grandchild')).toBe('long_term');
	});

	it('lets a subtask carrying its own goal leave its parent’s horizon', () => {
		const tasks = [task('parent', 'goal-someday'), task('child', 'goal-launch', 'parent')];
		expect(taskHorizons(tasks, [launch, someday]).get('child')).toBe('current');
	});
});

describe('currentWork', () => {
	it('leaves out the tasks under a long term goal', () => {
		const tasks = [task('a', 'goal-launch'), task('b', 'goal-someday'), task('c', null, 'b')];
		expect(currentWork(tasks, [launch, someday]).map((kept) => kept.id)).toEqual(['a']);
	});
});
