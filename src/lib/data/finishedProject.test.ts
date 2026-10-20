import { describe, expect, it } from 'vitest';
import { isFinishedProject } from './finishedProject';

describe('isFinishedProject', () => {
	it('is finished in maintenance with no open task', () => {
		expect(isFinishedProject({ status: 'maintenance', openTaskCount: 0 })).toBe(true);
	});

	it('is finished when complete with no open task', () => {
		expect(isFinishedProject({ status: 'complete', openTaskCount: 0 })).toBe(true);
	});

	it('is not finished while a task is open', () => {
		expect(isFinishedProject({ status: 'maintenance', openTaskCount: 1 })).toBe(false);
	});

	it('is not finished while still building, however empty', () => {
		expect(isFinishedProject({ status: 'building', openTaskCount: 0 })).toBe(false);
	});
});
