import './brandCampaignReportMocks';
import { beforeEach, describe, expect, it } from 'vitest';
import { brandCampaignReportActions } from './brandCampaignReportActions';
import { campaignId } from './brandCampaignWorld';
import { isGatedByModuleRule, moduleNotSwitchedOn } from '../organisationModuleGate';
import { noSuchCampaign } from './brandCampaignAnswers';
import { reportWorld, resetReportWorld } from './brandCampaignReportFixtures';
import { runReportAction } from './brandCampaignReportTestRunner';

const strangerId = '3d9f5e4a-6c3f-4e77-9c2a-5b3a4f6e7d8c';
const bands = [
	{ ageBand: '25-34', gender: 'female', reach: 1200, clicks: 30 },
	{ ageBand: '25-34', gender: 'male', reach: 800, clicks: 10 },
	{ ageBand: '45-54', gender: 'female', reach: 2000, clicks: 28 }
];
const audienceDay = { campaignId, observedOn: '2026-11-17', bands };

describe('recording who a paid campaign reached, and reading its report, over the connector', () => {
	beforeEach(() => resetReportWorld());

	it('builds both actions with the one module rule, and refuses while Brand is off', async () => {
		expect(brandCampaignReportActions.every(isGatedByModuleRule)).toBe(true);
		reportWorld.switchedOn = [];
		expect(await runReportAction('read_campaign_report', { campaignId })).toBe(moduleNotSwitchedOn('brand'));
	});

	it('records each band of the breakdown by whoever recorded it, and refuses one that does not fit by name', async () => {
		const answer = await runReportAction('record_campaign_audience', {
			...audienceDay,
			bands: [...bands, { ageBand: '30-40', gender: 'female' }]
		});
		expect(answer).toContain('Recorded 3 bands of the audience on 2026-11-17.');
		expect(answer).toContain('- band 4: ageBand is one of 13-17, 18-24');
		expect(reportWorld.kept[0]).toMatchObject({ organisationId: 'jewel', campaignId, accountId: 'nigel' });
	});

	it('does not add a band already held for the day, and records nothing for a campaign not in the brand', async () => {
		await runReportAction('record_campaign_audience', audienceDay);
		expect(await runReportAction('record_campaign_audience', audienceDay)).toContain('No band was recorded.');
		expect(await runReportAction('record_campaign_audience', { ...audienceDay, campaignId: strangerId })).toBe(noSuchCampaign);
		expect(await runReportAction('record_campaign_audience', { ...audienceDay, observedOn: 'Friday' })).toContain('Nothing was recorded');
		expect(reportWorld.kept).toHaveLength(1);
	});

	it('reads the report: the money, the reach, the cost of a click and who was reached, with the page to print', async () => {
		reportWorld.figures = { spendPence: 21000, impressions: 3717, reach: 3203, clicks: 68 };
		await runReportAction('record_campaign_audience', audienceDay);
		const report = await runReportAction('read_campaign_report', { campaignId });
		expect(report).toContain('Autumn fire doors [running]: paid for “Click through”, 2026-11-13 to 2026-11-17');
		expect(report).toContain('- Budget £500.00, spent £210.00');
		expect(report).toContain('- 3,717 impressions, 3,203 people reached');
		expect(report).toContain('- 68 clicks; a click cost £3.09');
		expect(report).toContain('- By age: 25 to 34 2,000 (50%), 40 clicks; 45 to 54 2,000 (50%), 28 clicks');
		expect(report).toContain('- By gender: Women 3,200 (80%), 58 clicks; Men 800 (20%), 10 clicks');
		expect(report).toContain(`https://yourbusiness.today/organisations/jewel/brand/campaigns/${campaignId}`);
	});

	it('says when no breakdown is held yet, and when the campaign is not the brand’s', async () => {
		expect(await runReportAction('read_campaign_report', { campaignId })).toContain('no breakdown has been recorded yet');
		expect(await runReportAction('read_campaign_report', { campaignId: strangerId })).toBe(noSuchCampaign);
		expect(await runReportAction('read_campaign_report', { campaignId: 'autumn' })).toBe(noSuchCampaign);
	});
});
