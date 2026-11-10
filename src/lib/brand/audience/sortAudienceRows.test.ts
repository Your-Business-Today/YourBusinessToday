import { describe, expect, it } from 'vitest';
import { sortAudienceRows } from './sortAudienceRows';

const women = { ageBand: '25-34', gender: 'female', reach: 1200, clicks: 30, spendPounds: '40.10' };

function refusalOf(band: Record<string, unknown>): string {
	return sortAudienceRows([band], new Set()).refusals[0] ?? '';
}

describe('sorting the bands of a campaign’s audience', () => {
	it('keeps each figure exactly as given, a missing one as nought, and spend in whole pence', () => {
		expect(sortAudienceRows([women], new Set()).kept).toEqual([
			{ ageBand: '25-34', gender: 'female', reach: 1200, impressions: 0, clicks: 30, spendPence: 4010 }
		]);
	});

	it('refuses a band or a gender the platforms do not report, and a figure its column cannot hold, by place', () => {
		expect(refusalOf({ ...women, ageBand: '30-40' })).toContain('band 1: ageBand is one of 13-17, 18-24, 25-34');
		expect(refusalOf({ ...women, gender: 'other' })).toContain('gender is one of female, male, unknown; other was given');
		expect(refusalOf({ ...women, reach: -1 })).toBe('band 1: reach cannot be below zero; -1 was given');
		expect(refusalOf({ ...women, clicks: 2.5 })).toBe('band 1: clicks is a whole number; 2.5 was given');
		expect(refusalOf({ ...women, spendPounds: 1.234 })).toContain('spendPounds has at most 2 decimal places');
		expect(refusalOf('not a band' as unknown as Record<string, unknown>)).toContain('ageBand is one of');
	});

	it('does not keep a band already held for the day, nor the same band twice in a call', () => {
		const men = { ...women, gender: 'male' };
		const sorted = sortAudienceRows([women, men, men], new Set(['25-34|female']));
		expect(sorted.kept.map((row) => row.gender)).toEqual(['male']);
		expect(sorted.refusals).toEqual([
			expect.stringContaining('band 1: that age band and gender already has figures'),
			expect.stringContaining('band 3: that age band and gender already has figures')
		]);
	});
});
