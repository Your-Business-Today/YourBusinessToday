import './brandCampaignMocks';
import { beforeEach, describe, expect, it } from 'vitest';
import { campaignId, campaignWorld, resetCampaignWorld } from './brandCampaignWorld';
import { runCampaignAction } from './brandCampaignTestRunner';
import { contentPieceId } from './brandContentFixtures';
import { isGatedByModuleRule, moduleNotSwitchedOn } from '../organisationModuleGate';
import { brandCampaignActions } from './brandCampaignActions';

const autumn = { name: 'Autumn', objective: 'purchase', budgetPounds: 500, startsOn: '2026-10-01', endsOn: '2026-10-31' };
const piece = { campaignId, contentPieceId };
const otherId = '3d9f5e4a-6c3f-4e77-9c2a-5b3a4f6e7d8c';

describe('planning a brand’s campaigns over the connector', () => {
	beforeEach(() => resetCampaignWorld());

	it('builds every action with the one module rule, and refuses while Brand is off', async () => {
		expect(brandCampaignActions.every(isGatedByModuleRule)).toBe(true);
		campaignWorld.switchedOn = [];
		expect(await runCampaignAction('plan_campaign', autumn)).toBe(moduleNotSwitchedOn('brand'));
	});

	it('plans a campaign at planned, with its budget in pence, and lists it with its pieces', async () => {
		expect(await runCampaignAction('plan_campaign', autumn)).toContain(`Planned “Autumn” for Jewel Enterprises’s brand (id ${campaignId})`);
		expect(campaignWorld.kept[0]).toMatchObject({ organisationId: 'jewel', accountId: 'nigel', plan: { budgetPence: 50000 } });
		expect(await runCampaignAction('add_content_to_campaign', piece)).toContain('The piece is behind the campaign');
		const listing = await runCampaignAction('list_campaigns', {});
		expect(listing).toContain('[planned] Autumn: purchase, £500.00, 2026-10-01 to 2026-10-31');
		expect(listing).toContain(`[approved] Fire doors (id ${contentPieceId})`);
	});

	it('refuses a value that does not fit its column, keeping nothing', async () => {
		expect(await runCampaignAction('plan_campaign', { ...autumn, budgetPounds: -5 })).toContain('budgetPounds cannot be below zero');
		expect(await runCampaignAction('plan_campaign', { ...autumn, endsOn: '2026-09-01' })).toContain('is before startsOn');
		expect(campaignWorld.kept).toHaveLength(0);
	});

	it('asks for the brand to be set up before a campaign is planned', async () => {
		campaignWorld.hasBrand = false;
		expect(await runCampaignAction('plan_campaign', autumn)).toContain('has no brand yet');
		expect(campaignWorld.kept).toHaveLength(0);
	});

	it('puts only the brand’s own piece behind the brand’s own campaign', async () => {
		await runCampaignAction('plan_campaign', autumn);
		expect(await runCampaignAction('add_content_to_campaign', { ...piece, campaignId: otherId })).toContain('No campaign of that id');
		expect(await runCampaignAction('add_content_to_campaign', { ...piece, contentPieceId: otherId })).toContain('No piece of that id');
		expect(await runCampaignAction('add_content_to_campaign', { ...piece, campaignId: 'nope' })).toContain('No campaign of that id');
		expect(campaignWorld.piecesPut).toHaveLength(0);
	});

	it('sets a campaign running, paused or ended, and refuses a status it cannot hold', async () => {
		await runCampaignAction('plan_campaign', autumn);
		expect(await runCampaignAction('set_campaign_status', { campaignId, status: 'running' })).toBe('The campaign is now running.');
		expect(await runCampaignAction('set_campaign_status', { campaignId, status: 'live' })).toContain('status is one of planned, running, paused, ended');
		expect(await runCampaignAction('set_campaign_status', { campaignId: otherId, status: 'ended' })).toContain('No campaign of that id');
		expect(campaignWorld.campaigns[0].status).toBe('running');
	});

	it('says when the brand has no campaigns yet', async () => {
		expect(await runCampaignAction('list_campaigns', {})).toBe('Jewel Enterprises’s brand has no campaigns yet.');
	});
});
