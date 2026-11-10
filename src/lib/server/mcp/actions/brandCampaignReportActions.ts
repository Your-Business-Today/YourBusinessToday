import { moduleAction } from '../organisationModuleGate';
import { readCampaignReportSchema, recordCampaignAudienceSchema } from './brandCampaignReportSchemas';
import { readReportOfCampaign, recordAudienceOfCampaign } from './brandCampaignReportRuns';
import type { McpAction } from '../actionTypes';

const brandModule = 'brand';
const brandArea = 'brand';

/** The connector actions on one paid campaign's report: record who it reached, and read what the money bought. */
export const brandCampaignReportActions: McpAction[] = [
	moduleAction(brandModule, {
		name: 'record_campaign_audience',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'record who a paid campaign reached, by age band and gender, as the platform’s breakdown gives it',
		guidance:
			'Record the breakdown exactly as the platform reports it on the day it is read, one entry per age band and gender. ' +
			'The campaign’s spend, impressions, reach and clicks are recorded with record_performance, naming the campaign. ' +
			'A band that does not fit is refused by name and the others are still recorded. A band already held for that day ' +
			'is not added again: a later breakdown is recorded on a later day, and the page shows the latest.',
		inputSchema: recordCampaignAudienceSchema,
		run: recordAudienceOfCampaign
	}),
	moduleAction(brandModule, {
		name: 'read_campaign_report',
		area: brandArea,
		audience: 'everyone',
		isWrite: false,
		summary: 'one paid campaign’s report: its dates, budget and spend, impressions, reach, clicks, a click’s cost and who it reached',
		guidance: 'The same report prints on one page from the address it gives, to send to a client who never signs in.',
		inputSchema: readCampaignReportSchema,
		run: readReportOfCampaign
	})
];
