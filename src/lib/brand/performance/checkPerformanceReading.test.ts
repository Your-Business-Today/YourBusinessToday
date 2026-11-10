import { describe, expect, it } from 'vitest';
import { checkPerformanceReading } from './checkPerformanceReading';

const pieceId = '1b7d3c2e-4a1d-4c55-8a0e-3f1e2d4c5b6a';
const reel = {
	medium: 'video.short.reels',
	observedOn: '2026-11-01',
	contentPieceId: pieceId,
	views: 1200,
	likes: 40
};

function problemOf(input: Record<string, unknown>): string {
	const check = checkPerformanceReading(input);
	return 'problem' in check ? check.problem : '';
}

describe('checking a performance reading against its columns', () => {
	it('keeps the figures exactly as given, a missing figure as nought, and spend in whole pence', () => {
		expect(checkPerformanceReading({ ...reel, spendPounds: '12.50' })).toEqual({
			reading: {
				mediumPath: 'video.short.reels',
				observedOn: '2026-11-01',
				contentPieceId: pieceId,
				campaignId: null,
				views: 1200,
				watchSeconds: 0,
				likes: 40,
				comments: 0,
				shares: 0,
				saves: 0,
				clicks: 0,
				conversions: 0,
				spendPence: 1250
			}
		});
	});

	it('refuses a figure below zero, with a fraction, or too large for its column, rather than repair it', () => {
		expect(problemOf({ ...reel, views: -4 })).toBe('views cannot be below zero; -4 was given');
		expect(problemOf({ ...reel, shares: 2.5 })).toBe('shares is a whole number; 2.5 was given');
		expect(problemOf({ ...reel, clicks: 2_147_483_648 })).toBe('clicks is at most 2147483647; 2147483648 was given');
		expect(problemOf({ ...reel, saves: 'many' })).toContain('saves is a whole number, such as 120');
		expect(problemOf({ ...reel, spendPounds: -1 })).toBe('spendPounds cannot be below zero; -1 was given');
	});

	it('asks for the piece or the campaign the figures are for, written as an id', () => {
		expect(problemOf({ ...reel, contentPieceId: '' })).toContain('name the piece (contentPieceId) or the campaign');
		expect(problemOf({ ...reel, campaignId: 'autumn' })).toContain('campaignId autumn is not an id');
	});

	it('refuses a medium the catalogue does not hold, and a day not on the calendar', () => {
		expect(problemOf({ ...reel, medium: 'video.tiktok.dance' })).toContain('video.tiktok.dance is not a medium');
		expect(problemOf({ ...reel, observedOn: '2026-02-30' })).toContain('not a day on the calendar');
	});
});
