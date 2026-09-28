import { describe, expect, it } from 'vitest';
import { backlogEmptyMessage } from './backlogEmptyMessage';

describe('backlogEmptyMessage', () => {
	it('names the person whose tasks were asked for', () => {
		const reason = { assigneeLabel: 'Dan', isWaitingOnMeOnly: false, hasTasks: true };
		expect(backlogEmptyMessage(reason)).toBe('Nothing open is assigned to Dan.');
	});

	it('speaks to the viewer about their own tasks, before any other filter', () => {
		const reason = { assigneeLabel: 'you', isWaitingOnMeOnly: true, hasTasks: true };
		expect(backlogEmptyMessage(reason)).toBe('Nothing open is assigned to you.');
	});

	it('explains an empty waiting-on-me view', () => {
		const reason = { assigneeLabel: null, isWaitingOnMeOnly: true, hasTasks: true };
		expect(backlogEmptyMessage(reason)).toBe('Nothing is waiting on you or your Claude.');
	});

	it('tells a finished backlog from an empty one', () => {
		const finished = { assigneeLabel: null, isWaitingOnMeOnly: false, hasTasks: true };
		const empty = { assigneeLabel: null, isWaitingOnMeOnly: false, hasTasks: false };
		expect(backlogEmptyMessage(finished)).toContain('Everything here is done');
		expect(backlogEmptyMessage(empty)).toBe('No tasks yet — add one.');
	});
});
