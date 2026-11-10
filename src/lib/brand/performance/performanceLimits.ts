import { CampaignLimits } from '../campaigns/campaignLimits';

/** The limits of a reading's own columns (migration 0179), read by the check at the door that writes one. */
export const PerformanceLimits = {
	largestCount: 2_147_483_647,
	largestSpendPence: CampaignLimits.largestBudgetPence,
	mostReadingsAtOnce: 200
} as const;
