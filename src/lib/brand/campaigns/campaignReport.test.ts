import { describe, expect, it } from 'vitest';
import { campaignReportOf } from './campaignReport';
import type { AudienceRow } from '../audience/audienceRow';

const campaign = {
	id: '2c8e4d3f-5b2e-4d66-8b1f-4a2f3e5d6c7b',
	name: 'Autumn fire doors',
	objective: 'clickThrough',
	budgetPence: 50000,
	startsOn: '2026-11-13',
	endsOn: '2026-11-17',
	status: 'ended' as const
};

function band(ageBand: AudienceRow['ageBand'], gender: AudienceRow['gender'], reach: number, clicks: number): AudienceRow {
	return { ageBand, gender, reach, clicks, impressions: 0, spendPence: 0 };
}

describe('the report of one paid campaign', () => {
	it('gives the cost of a click to the penny, and none until there is a click', () => {
		const figures = { spendPence: 21000, impressions: 3717, reach: 3203, clicks: 68 };
		const nobody = { observedOn: null, rows: [] };
		expect(campaignReportOf({ campaign, figures, audience: nobody }).costPerClickPence).toBe(309);
		expect(campaignReportOf({ campaign, figures: { ...figures, clicks: 0 }, audience: nobody }).costPerClickPence).toBeNull();
	});

	it('breaks the audience down by age band, youngest first, and by gender, each as a part of everyone reached', () => {
		const rows = [band('45-54', 'female', 300, 2), band('18-24', 'male', 100, 1), band('18-24', 'female', 600, 9)];
		const audience = { observedOn: '2026-11-17', rows };
		const report = campaignReportOf({ campaign, figures: { spendPence: 0, impressions: 0, reach: 0, clicks: 0 }, audience });
		expect(report.audienceObservedOn).toBe('2026-11-17');
		expect(report.byAgeBand.map(({ label, reach, clicks, shareOfReach }) => [label, reach, clicks, shareOfReach])).toEqual([
			['18 to 24', 700, 10, 0.7],
			['45 to 54', 300, 2, 0.3]
		]);
		expect(report.byGender.map(({ key, shareOfReach }) => [key, shareOfReach])).toEqual([
			['female', 0.9],
			['male', 0.1]
		]);
	});
});
