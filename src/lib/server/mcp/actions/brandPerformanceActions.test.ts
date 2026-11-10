import './brandPerformanceMocks';
import { beforeEach, describe, expect, it } from 'vitest';
import { brandPerformanceActions } from './brandPerformanceActions';
import { campaignId } from './brandCampaignWorld';
import { contentPieceId } from './brandContentFixtures';
import { isGatedByModuleRule, moduleNotSwitchedOn } from '../organisationModuleGate';
import { performanceWorld, resetPerformanceWorld } from './brandPerformanceFixtures';
import { runPerformanceAction } from './brandPerformanceTestRunner';

const reel = {
	medium: 'video.short.reels',
	observedOn: '2026-11-01',
	contentPieceId,
	views: 1200,
	likes: 30,
	spendPounds: 12.5
};
const campaignDay = {
	medium: 'image.post.facebook',
	observedOn: '2026-11-02',
	campaignId,
	views: 300,
	clicks: 12,
	spendPounds: 40
};

describe('recording and reading a brand’s performance over the connector', () => {
	beforeEach(() => resetPerformanceWorld());

	it('builds both actions with the one module rule, and refuses while Brand is off', async () => {
		expect(brandPerformanceActions.every(isGatedByModuleRule)).toBe(true);
		performanceWorld.switchedOn = [];
		expect(await runPerformanceAction('record_performance', { readings: [reel] })).toBe(moduleNotSwitchedOn('brand'));
	});

	it('records many readings at once for a piece and a campaign, by whoever recorded them', async () => {
		expect(
			await runPerformanceAction('record_performance', {
				readings: [reel, campaignDay]
			})
		).toBe('Recorded 2 readings for Jewel Enterprises’s brand. read_performance adds them up.');
		expect(performanceWorld.kept[0]).toMatchObject({
			organisationId: 'jewel',
			accountId: 'nigel'
		});
		expect(performanceWorld.held.map((reading) => reading.spendPence)).toEqual([1250, 4000]);
	});

	it('refuses a reading that does not fit by name, and still records the others', async () => {
		const answer = await runPerformanceAction('record_performance', {
			readings: [{ ...reel, views: -3 }, campaignDay]
		});
		expect(answer).toContain('Recorded one reading');
		expect(answer).toContain('- reading 1: views cannot be below zero; -3 was given');
		expect(performanceWorld.held).toHaveLength(1);
	});

	it('records nothing when no reading is given, too many are, or the brand is not set up', async () => {
		expect(await runPerformanceAction('record_performance', { readings: [] })).toContain('at least one reading');
		const tooMany = Array.from({ length: 201 }, () => reel);
		expect(await runPerformanceAction('record_performance', { readings: tooMany })).toContain('send at most 200 at once');
		performanceWorld.hasBrand = false;
		expect(await runPerformanceAction('record_performance', { readings: [reel] })).toContain('has no brand yet');
		expect(performanceWorld.kept).toHaveLength(0);
	});

	it('reads the performance back medium by medium, with the total', async () => {
		await runPerformanceAction('record_performance', {
			readings: [reel, campaignDay]
		});
		const answer = await runPerformanceAction('read_performance', {
			since: '2026-11-01'
		});
		expect(answer).toContain('- video.short.reels: 1,200 views, 0 seconds watched, 30 engagements');
		expect(answer).toContain('- total: 1,500 views');
		expect(answer).toContain('12 clicks, 0 conversions, £52.50 spent');
	});

	it('says when there are no readings, and refuses a day that is not a date', async () => {
		expect(await runPerformanceAction('read_performance', { since: '2026-11-01' })).toBe(
			'Jewel Enterprises’s brand has no readings since 2026-11-01.'
		);
		expect(await runPerformanceAction('read_performance', { since: 'last week' })).toContain('since is a date written as');
	});
});
