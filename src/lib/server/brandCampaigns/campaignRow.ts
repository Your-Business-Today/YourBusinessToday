import type { CampaignHead, CampaignStatus } from '$lib/brand/campaigns/campaign';

type Row = Record<string, unknown>;

/** The columns of brand_campaigns a campaign is read from. */
export const campaignColumns = 'id, name, objective, budget_pence, starts_on, ends_on, status';

/** A campaign as one row of brand_campaigns holds it. */
export function campaignHeadOf(row: Row): CampaignHead {
	return {
		id: row.id as string,
		name: row.name as string,
		objective: row.objective as string,
		budgetPence: Number(row.budget_pence),
		startsOn: row.starts_on as string,
		endsOn: row.ends_on as string,
		status: row.status as CampaignStatus
	};
}
