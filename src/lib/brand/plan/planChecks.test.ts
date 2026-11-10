import { describe, expect, it } from 'vitest';
import { checkContentIdea } from '../content/contentIdea';
import { checkPlanMonth, monthBoundsOf } from './planMonth';
import { checkUkDayAndTime } from './checkUkDayAndTime';
import { ContentLimits } from '../content/contentLimits';

const idea = { medium: 'image.post.facebook', title: 'Fire doors', hook: 'Hear that?', plannedFor: '2026-11-03T09:00:00Z' };

describe('checking an idea for a day', () => {
	it('keeps an idea with its medium, title, opening line and day, before any script exists', () => {
		const check = checkContentIdea(idea);
		expect(check).toMatchObject({ idea: { title: 'Fire doors', hook: 'Hear that?', plannedFor: '2026-11-03T09:00:00.000Z' } });
	});

	it('refuses by name a value that does not fit its column', () => {
		expect(checkContentIdea({ ...idea, medium: 'smoke.signal' })).toEqual({ problem: expect.stringContaining('is not a medium') });
		expect(checkContentIdea({ ...idea, title: ' ' })).toEqual({ problem: expect.stringContaining('title is empty') });
		const longHook = 'x'.repeat(ContentLimits.hookCharacters + 1);
		expect(checkContentIdea({ ...idea, hook: longHook })).toEqual({ problem: expect.stringContaining('keep it to 300') });
		expect(checkContentIdea({ ...idea, plannedFor: 'Tuesday' })).toEqual({ problem: expect.stringContaining('plannedFor is an ISO') });
	});
});

describe('the month and the day on the UK clock', () => {
	it('reads a month as YYYY-MM and refuses anything else', () => {
		expect(checkPlanMonth('2026-11')).toEqual({ month: { year: 2026, month: 11 } });
		expect(checkPlanMonth('2026-13')).toHaveProperty('problem');
		expect(checkPlanMonth('November')).toHaveProperty('problem');
	});

	it('bounds a month at UK midnight, in summer time too', () => {
		expect(monthBoundsOf({ year: 2026, month: 7 })).toEqual({ startsAt: '2026-06-30T23:00:00.000Z', endsAt: '2026-07-31T23:00:00.000Z' });
		expect(monthBoundsOf({ year: 2026, month: 12 }).endsAt).toBe('2027-01-01T00:00:00.000Z');
	});

	it('turns the form’s day and time into the moment the UK clock shows them', () => {
		expect(checkUkDayAndTime({ date: '2026-07-01', time: '09:00' })).toEqual({ moment: '2026-07-01T08:00:00.000Z' });
		expect(checkUkDayAndTime({ date: '2026-03-29', time: '01:30' })).toHaveProperty('problem');
		expect(checkUkDayAndTime({ date: '', time: '09:00' })).toHaveProperty('problem');
		expect(checkUkDayAndTime({ date: '2026-07-01', time: '25:00' })).toHaveProperty('problem');
	});
});
