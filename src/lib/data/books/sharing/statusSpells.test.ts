import { describe, expect, it } from 'vitest';
import { beforeTheHistoryBegan, liveSpellsOf, membersByStatus, type ProjectStatusChange } from './statusSpells';

const starting = (status: string, changedMonth = '2026-11'): ProjectStatusChange => ({ status, changedMonth, isStartingStatus: true });
const change = (status: string, changedMonth: string): ProjectStatusChange => ({ status, changedMonth, isStartingStatus: false });

describe('liveSpellsOf', () => {
	it('reads a live starting status back to every month before the history began', () => {
		expect(liveSpellsOf([starting('building')])).toEqual([{ joinedMonth: beforeTheHistoryBegan, leftMonth: null }]);
	});

	it('keeps a project put on hold sharing the month it happened, and leaves it out from the month after', () => {
		expect(liveSpellsOf([starting('maintenance'), change('on_hold', '2026-12')])).toEqual([{ joinedMonth: beforeTheHistoryBegan, leftMonth: '2026-12' }]);
	});

	it('joins a project in the month it moves into building, and never before a project made later was made', () => {
		expect(liveSpellsOf([starting('scoping'), change('building', '2027-02')])).toEqual([{ joinedMonth: '2027-02', leftMonth: null }]);
		expect(liveSpellsOf([change('testing', '2027-01')])).toEqual([{ joinedMonth: '2027-01', leftMonth: null }]);
	});

	it('runs on through moves between live statuses, and through a hold taken off within the month', () => {
		const changes = [starting('building'), change('testing', '2026-12'), change('on_hold', '2027-01'), change('maintenance', '2027-01')];
		expect(liveSpellsOf(changes)).toEqual([{ joinedMonth: beforeTheHistoryBegan, leftMonth: null }]);
	});

	it('starts a second spell when a project comes back after a month or more on hold', () => {
		const changes = [starting('building'), change('on_hold', '2026-12'), change('building', '2027-03')];
		expect(liveSpellsOf(changes)).toEqual([
			{ joinedMonth: beforeTheHistoryBegan, leftMonth: '2026-12' },
			{ joinedMonth: '2027-03', leftMonth: null }
		]);
	});
});

describe('membersByStatus', () => {
	it('gives every live spell of every project a member of its own, and none to a project never live', () => {
		const histories = new Map([
			['carp-mania', [starting('building')]],
			['dog-tinder', [starting('on_hold')]]
		]);
		expect(membersByStatus(histories)).toEqual([{ id: 'status-carp-mania-0', projectId: 'carp-mania', joinedMonth: beforeTheHistoryBegan, leftMonth: null }]);
	});
});
