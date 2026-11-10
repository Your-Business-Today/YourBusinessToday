import { moneyColumnLimits } from '$lib/data/books/moneyColumn';
import { toPence } from '$lib/data/books/money';

/** The limits of a campaign's own columns (migration 0177), read by the check at every door that writes one. */
export const CampaignLimits = {
	nameCharacters: 120,
	largestBudgetPence: toPence(moneyColumnLimits.largest)
} as const;
