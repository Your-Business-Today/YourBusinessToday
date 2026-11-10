import { describe, expect, it } from 'vitest';
import { summarisePerformance, totalOf, type ReadingFigures } from './summarisePerformance';

const nothing = {
	views: 0,
	watchSeconds: 0,
	likes: 0,
	comments: 0,
	shares: 0,
	saves: 0,
	clicks: 0,
	conversions: 0,
	impressions: 0,
	reach: 0,
	spendPence: 0
};

function reading(mediumPath: string, figures: Partial<ReadingFigures>): ReadingFigures {
	return { ...nothing, mediumPath, ...figures };
}

describe('adding up a brand’s performance', () => {
	const readings = [
		reading('video.short.reels', {
			views: 100,
			likes: 3,
			comments: 2,
			spendPence: 500
		}),
		reading('text.post.linkedin', {
			views: 400,
			clicks: 9,
			shares: 1,
			saves: 1
		}),
		reading('video.short.reels', {
			views: 50,
			likes: 1,
			conversions: 2,
			spendPence: 250
		})
	];

	it('adds each medium’s readings together, the medium seen most first, engagements counted as one', () => {
		const mediums = summarisePerformance(readings);
		expect(mediums.map((medium) => medium.mediumPath)).toEqual(['text.post.linkedin', 'video.short.reels']);
		expect(mediums[1]).toMatchObject({
			views: 150,
			likes: 4,
			comments: 2,
			engagements: 6,
			conversions: 2,
			spendPence: 750
		});
	});

	it('gives the total of every medium', () => {
		const total = totalOf(summarisePerformance(readings));
		expect(total).toMatchObject({
			mediumPath: 'total',
			views: 550,
			engagements: 8,
			clicks: 9,
			spendPence: 750
		});
	});
});
