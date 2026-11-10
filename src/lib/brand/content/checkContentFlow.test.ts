import { describe, expect, it } from 'vitest';
import { checkContentReview } from './checkContentReview';
import { checkScheduledFor } from './checkScheduledFor';

describe('checking a review against its columns', () => {
	it('keeps an approval with nothing said, and a change asked for with its reason', () => {
		expect(checkContentReview({ verdict: 'approved' })).toEqual({
			review: { verdict: 'approved', body: '' }
		});
		const changes = checkContentReview({
			verdict: 'changes_requested',
			body: ' Shorter hook '
		});
		expect(changes).toEqual({
			review: { verdict: 'changes_requested', body: 'Shorter hook' }
		});
	});

	it('refuses a verdict there is not', () => {
		expect(checkContentReview({ verdict: 'love it' })).toEqual({
			problem: 'verdict is one of comment, changes_requested, approved'
		});
	});

	it('refuses a comment or a change asked for that says nothing', () => {
		expect(checkContentReview({ verdict: 'comment', body: '  ' })).toHaveProperty('problem');
		expect(checkContentReview({ verdict: 'changes_requested' })).toHaveProperty('problem');
	});

	it('refuses words longer than the column, rather than trimming them', () => {
		const check = checkContentReview({
			verdict: 'comment',
			body: 'x'.repeat(2001)
		});
		expect(check).toEqual({
			problem: 'body is 2001 characters; keep it to 2000'
		});
	});

	it('refuses words given as something else', () => {
		expect(checkContentReview({ verdict: 'comment', body: 7 })).toEqual({
			problem: 'body is words, not number'
		});
	});
});

describe('checking when a piece goes out', () => {
	it('keeps an ISO date and time with its zone, as UTC', () => {
		expect(checkScheduledFor('2026-12-01T09:00:00+01:00')).toEqual({
			scheduledFor: '2026-12-01T08:00:00.000Z'
		});
		expect(checkScheduledFor('2026-12-01T09:00Z')).toEqual({
			scheduledFor: '2026-12-01T09:00:00.000Z'
		});
	});

	it('refuses a time with no zone, rather than guessing one', () => {
		expect(checkScheduledFor('2026-12-01T09:00')).toHaveProperty('problem');
		expect(checkScheduledFor('next Tuesday')).toHaveProperty('problem');
		expect(checkScheduledFor(20261201)).toHaveProperty('problem');
	});

	it('refuses a day the calendar does not have, rather than rolling it over', () => {
		const check = checkScheduledFor('2026-02-31T09:00:00Z');
		expect(check).toEqual({
			problem: expect.stringContaining('is not a time on the calendar')
		});
		expect(checkScheduledFor('2026-02-28T25:00:00Z')).toHaveProperty('problem');
	});
});
