import { describe, expect, it } from 'vitest';
import { feedActorName, feedEventSentence, isFeedEventFor, parseFeedScope, type FeedEvent } from './feedEvent';
import { groupFeedByDay, feedDayLabel } from './feedDays';
import { scoreFeedToday } from './feedScore';
import { parseFeedEventKind } from './feedEventKind';

const now = new Date('2026-10-09T15:00:00Z');

function event(overrides: Partial<FeedEvent>): FeedEvent {
	return {
		id: 'e1',
		kind: 'task_done',
		projectId: 'p1',
		projectName: 'YourBusinessToday',
		taskId: 't1',
		taskTitle: 'Round the invoice total',
		actorAccountId: 'james',
		actorName: 'James',
		forAccountId: 'nigel',
		detail: '',
		createdAt: '2026-10-09T14:32:00Z',
		...overrides
	};
}

describe('feedEventSentence', () => {
	it('reads as who did what to which task on which project', () => {
		expect(feedEventSentence(event({}))).toBe(
			'James finished the task “Round the invoice total” on YourBusinessToday'
		);
		expect(feedEventSentence(event({ kind: 'task_started' }))).toContain('James started the task');
	});

	it('credits a merged pull request or the connector when nobody signed in made the move', () => {
		expect(feedActorName(event({ actorName: null }))).toBe('A merged pull request');
		expect(feedActorName(event({ actorName: null, kind: 'task_started' }))).toBe(
			'A Claude through the connector'
		);
	});
});

describe('the feed scope', () => {
	it('is mine only when asked for, and marks the events for that person', () => {
		expect(parseFeedScope('mine')).toBe('mine');
		expect(parseFeedScope(null)).toBe('everything');
		expect(isFeedEventFor(event({}), 'nigel')).toBe(true);
		expect(isFeedEventFor(event({}), 'james')).toBe(false);
	});
});

describe('groupFeedByDay', () => {
	it('puts each day under its heading, today and yesterday by name', () => {
		const days = groupFeedByDay(
			[
				event({ id: 'a', createdAt: '2026-10-09T14:32:00Z' }),
				event({ id: 'b', createdAt: '2026-10-09T09:00:00Z' }),
				event({ id: 'c', createdAt: '2026-10-08T18:00:00Z' }),
				event({ id: 'd', createdAt: '2026-10-01T18:00:00Z' })
			],
			now
		);
		expect(days.map((day) => day.label)).toEqual(['Today', 'Yesterday', '1 Oct 2026']);
		expect(days[0].events.map((item) => item.id)).toEqual(['a', 'b']);
		expect(feedDayLabel('2026-10-09T01:00:00Z', now)).toBe('Today');
	});
});

describe('scoreFeedToday', () => {
	it('counts only today, by kind', () => {
		const score = scoreFeedToday(
			[
				event({ kind: 'task_done' }),
				event({ kind: 'task_done', createdAt: '2026-10-08T14:00:00Z' }),
				event({ kind: 'task_started' }),
				event({ kind: 'task_raised' }),
				event({ kind: 'pull_request_opened' }),
				event({ kind: 'task_put_on_hold' })
			],
			now
		);
		expect(score).toEqual({ doneCount: 1, startedCount: 1, raisedCount: 1, pullRequestCount: 1 });
	});
});

describe('parseFeedEventKind', () => {
	it('knows the six kinds and nothing else', () => {
		expect(parseFeedEventKind('task_done')).toBe('task_done');
		expect(parseFeedEventKind('goal_met')).toBeNull();
	});
});
