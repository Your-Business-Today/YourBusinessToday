import { audienceByAgeBand, audienceByGender, type AudienceShare } from '../audience/audienceBreakdown';
import type { AudienceRow } from '../audience/audienceRow';
import type { CampaignHead } from './campaign';

/** What a campaign's readings add up to: the money spent, the times it was shown, the people it reached and the clicks. */
export type CampaignFigures = { spendPence: number; impressions: number; reach: number; clicks: number };

/** The latest breakdown of who a campaign reached, and the day the platform gave it. */
export type CampaignAudience = { observedOn: string | null; rows: AudienceRow[] };

/** One paid campaign as its page and read_campaign_report show it: what it cost, who it reached and who clicked. */
export type CampaignReport = {
	campaign: CampaignHead;
	figures: CampaignFigures;
	costPerClickPence: number | null;
	audienceObservedOn: string | null;
	byAgeBand: AudienceShare[];
	byGender: AudienceShare[];
};

export type CampaignReading = { campaign: CampaignHead; figures: CampaignFigures; audience: CampaignAudience };

/** The report of one campaign from its figures and its latest audience; a click's cost is only given once there is a click. */
export function campaignReportOf({ campaign, figures, audience }: CampaignReading): CampaignReport {
	return {
		campaign,
		figures,
		costPerClickPence: costPerClickOf(figures),
		audienceObservedOn: audience.observedOn,
		byAgeBand: audienceByAgeBand(audience.rows),
		byGender: audienceByGender(audience.rows)
	};
}

function costPerClickOf({ spendPence, clicks }: CampaignFigures): number | null {
	if (clicks === 0) return null;
	return Math.round(spendPence / clicks);
}
