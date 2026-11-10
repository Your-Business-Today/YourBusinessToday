import { ageBands, genders } from '$lib/brand/audience/audienceBands';
import { objectSchema, textField } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import { PerformanceLimits } from '$lib/brand/performance/performanceLimits';

const campaignIdField = textField('The campaign, as list_campaigns gives it');

const bandSchema = objectSchema(
	{
		ageBand: { type: 'string', enum: [...ageBands], description: 'The age band, as the platform reports it' },
		gender: { type: 'string', enum: [...genders], description: 'The gender, as the platform reports it' },
		reach: { type: 'integer', minimum: 0, description: 'People of this band and gender the campaign reached' },
		impressions: { type: 'integer', minimum: 0, description: 'Times the campaign was shown to them' },
		clicks: { type: 'integer', minimum: 0, description: 'Clicks they made' },
		spendPounds: { type: 'number', minimum: 0, description: 'What reaching them cost, in pounds, such as 12.50' }
	},
	['ageBand', 'gender']
);

export const recordCampaignAudienceSchema = objectSchema(
	{
		organisationId: organisationIdField,
		campaignId: campaignIdField,
		observedOn: textField('The day the platform gave the breakdown, written as 2026-11-30'),
		bands: {
			type: 'array',
			items: bandSchema,
			minItems: 1,
			maxItems: PerformanceLimits.mostReadingsAtOnce,
			description: 'The breakdown by age band and gender: one entry for each pair the platform reports'
		}
	},
	['organisationId', 'campaignId', 'observedOn', 'bands']
);

export const readCampaignReportSchema = objectSchema(
	{ organisationId: organisationIdField, campaignId: campaignIdField },
	['organisationId', 'campaignId']
);
