import { addContentToCampaign, listCampaigns, planCampaign, setStatusOfCampaign } from './brandCampaignRuns';
import {
	addContentToCampaignSchema,
	listCampaignsSchema,
	planCampaignSchema,
	setCampaignStatusSchema
} from './brandCampaignSchemas';
import { moduleAction } from '../organisationModuleGate';
import type { McpAction } from '../actionTypes';

const brandModule = 'brand';
const brandArea = 'brand';

/** Every connector action on an organisation's brand campaigns: plan one, list them, put content behind one, set its status. */
export const brandCampaignActions: McpAction[] = [
	moduleAction(brandModule, {
		name: 'plan_campaign',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'plan a paid campaign towards an audience action, with its whole budget and its dates',
		guidance:
			'The budget is in pounds and never below zero, and a campaign ends on or after the day it starts. It starts at ' +
			'planned. Nothing connects to an ad account. A value that does not fit its column is refused by name and nothing is kept.',
		inputSchema: planCampaignSchema,
		run: planCampaign
	}),
	moduleAction(brandModule, {
		name: 'list_campaigns',
		area: brandArea,
		audience: 'everyone',
		isWrite: false,
		summary: 'the brand’s campaigns, latest start first, with the pieces in each',
		inputSchema: listCampaignsSchema,
		run: listCampaigns
	}),
	moduleAction(brandModule, {
		name: 'add_content_to_campaign',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'put one of the brand’s pieces of content behind one of its campaigns',
		inputSchema: addContentToCampaignSchema,
		run: addContentToCampaign
	}),
	moduleAction(brandModule, {
		name: 'set_campaign_status',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'mark a campaign planned, running, paused or ended',
		inputSchema: setCampaignStatusSchema,
		run: setStatusOfCampaign
	})
];
