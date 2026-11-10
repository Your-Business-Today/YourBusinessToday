import { audienceActions } from '$lib/brand/actions/audienceActions';
import { campaignStatuses } from '$lib/brand/campaigns/campaign';
import { CampaignLimits } from '$lib/brand/campaigns/campaignLimits';
import { objectSchema, textField } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';

const campaignIdField = textField('The campaign’s id, as plan_campaign or list_campaigns gives it');

export const planCampaignSchema = objectSchema(
	{
		organisationId: organisationIdField,
		name: textField(`What the campaign is called, at most ${CampaignLimits.nameCharacters} characters`),
		objective: {
			type: 'string',
			enum: audienceActions.map((action) => action.key),
			description: 'The audience action the campaign pays for, such as clickThrough or purchase'
		},
		budgetPounds: { type: 'number', description: 'The whole budget in pounds, such as 500 or 120.50, never below zero' },
		startsOn: textField('The day it starts, written as 2026-12-01'),
		endsOn: textField('The day it ends, written as 2026-12-31, on or after the day it starts')
	},
	['organisationId', 'name', 'objective', 'budgetPounds', 'startsOn', 'endsOn']
);

export const listCampaignsSchema = objectSchema({ organisationId: organisationIdField }, ['organisationId']);

export const addContentToCampaignSchema = objectSchema(
	{
		organisationId: organisationIdField,
		campaignId: campaignIdField,
		contentPieceId: textField('The piece’s id, as draft_content or list_content gives it')
	},
	['organisationId', 'campaignId', 'contentPieceId']
);

export const setCampaignStatusSchema = objectSchema(
	{
		organisationId: organisationIdField,
		campaignId: campaignIdField,
		status: { type: 'string', enum: campaignStatuses, description: 'planned, running, paused or ended' }
	},
	['organisationId', 'campaignId', 'status']
);
