import { describe, expect, it } from 'vitest';
import { checkReadings, sortReadings } from './sortReadings';
import { readingKey } from './readingKey';

const pieceId = '1b7d3c2e-4a1d-4c55-8a0e-3f1e2d4c5b6a';
const campaignId = '2c8e4d3f-5b2e-4d66-8b1f-4a2f3e5d6c7b';
const strangerId = '3d9f5e4a-6c3f-4e77-9c2a-5b3a4f6e7d8c';
const reel = {
	medium: 'video.short.reels',
	observedOn: '2026-11-01',
	contentPieceId: pieceId,
	views: 10
};

function known(readingKeys: string[] = []) {
	return {
		pieceIds: new Set([pieceId]),
		campaignIds: new Set([campaignId]),
		readingKeys: new Set(readingKeys)
	};
}

describe('sorting the readings of one call', () => {
	it('refuses the reading that does not fit by its place, and still checks the others', () => {
		const { checked, refusals } = checkReadings([reel, { ...reel, views: -1 }, 'not a reading']);
		expect(checked.map((entry) => entry.position)).toEqual([0]);
		expect(refusals).toEqual(['reading 2: views cannot be below zero; -1 was given', expect.stringContaining('reading 3:')]);
	});

	it('keeps a reading for the brand’s own piece or campaign, and refuses one for anything else', () => {
		const given = [reel, { ...reel, contentPieceId: strangerId }, { ...reel, contentPieceId: '', campaignId: strangerId }];
		const sorted = sortReadings(checkReadings(given).checked, known());
		expect(sorted.kept).toHaveLength(1);
		expect(sorted.refusals).toEqual([
			expect.stringContaining('reading 2: no piece of that id'),
			expect.stringContaining('reading 3: no campaign of that id')
		]);
	});

	it('does not add a reading the brand already holds for that day, nor the same one twice in a call', () => {
		const held = readingKey({
			contentPieceId: pieceId,
			campaignId: null,
			mediumPath: reel.medium,
			observedOn: '2026-11-01'
		});
		const nextDay = { ...reel, observedOn: '2026-11-02' };
		const sorted = sortReadings(checkReadings([reel, nextDay, nextDay]).checked, known([held]));
		expect(sorted.kept.map((reading) => reading.observedOn)).toEqual(['2026-11-02']);
		expect(sorted.refusals).toEqual([
			expect.stringContaining('reading 1: that piece or campaign already has a reading'),
			expect.stringContaining('reading 3: that piece or campaign already has a reading')
		]);
	});
});
