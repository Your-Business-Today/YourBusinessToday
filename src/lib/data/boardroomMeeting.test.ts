import { describe, expect, it } from 'vitest';
import {
	directorsOnMeeting,
	meetingStage,
	nextAgendaPosition,
	standingAgenda,
	type AgendaItem,
	type BoardroomMeeting
} from './boardroomMeeting';
import type { BoardroomDirector } from './boardroomDirector';

const meeting: BoardroomMeeting = {
	id: 'meeting',
	organisationId: 'ybt',
	meetsAt: '2026-11-12T10:00:00.000Z',
	chairDirectorId: 'nigels-seat',
	calledByDirectorId: 'nigels-seat',
	calledAt: '2026-11-10T18:00:00.000Z',
	openedAt: null,
	closedAt: null
};
const before = new Date('2026-11-11T10:00:00Z');
const after = new Date('2026-11-12T10:00:00Z');

function seat(id: string, namedAt: string, stoodDownAt: string | null = null): BoardroomDirector {
	return {
		id,
		organisationId: 'ybt',
		accountId: id,
		name: id,
		namedAt,
		stoodDownAt
	};
}

function item(position: number, withdrawnAt: string | null = null): AgendaItem {
	return {
		id: `item-${position}`,
		meetingId: 'meeting',
		position,
		title: `Item ${position}`,
		purpose: 'noting',
		isAnyOtherBusiness: false,
		withdrawnAt
	};
}

describe('where a meeting stands', () => {
	it('is called until its time, then open, and closed once closed', () => {
		expect(meetingStage(meeting, before)).toBe('called');
		expect(meetingStage(meeting, after)).toBe('open');
		expect(meetingStage({ ...meeting, openedAt: before.toISOString() }, before)).toBe('open');
		expect(meetingStage({ ...meeting, closedAt: after.toISOString() }, after)).toBe('closed');
	});
});

describe('who is on a meeting', () => {
	const directors = [
		seat('nigel', '2026-11-01T00:00:00Z'),
		seat('james', '2026-11-11T12:00:00Z'),
		seat('jeremy', '2026-11-01T00:00:00Z', '2026-11-12T12:00:00Z')
	];

	it('is everyone sitting now while it is still to come', () => {
		expect(directorsOnMeeting(directors, meeting, before).map((director) => director.id)).toEqual(['nigel', 'jeremy']);
	});

	it('is everyone sitting when it met, once it has, whoever stood down since', () => {
		const later = new Date('2026-12-01T00:00:00Z');
		expect(directorsOnMeeting(directors, meeting, later).map((director) => director.id)).toEqual([
			'nigel',
			'james',
			'jeremy'
		]);
	});
});

describe('the agenda', () => {
	it('numbers the items not withdrawn, in order, and adds after every item ever placed', () => {
		const items = [item(3), item(1), item(2, '2026-11-11T00:00:00Z')];
		expect(standingAgenda(items).map((standing) => standing.position)).toEqual([1, 3]);
		expect(nextAgendaPosition(items)).toBe(4);
		expect(nextAgendaPosition([])).toBe(1);
	});
});
