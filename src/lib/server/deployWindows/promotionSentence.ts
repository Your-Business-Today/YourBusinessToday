import { deployWindowOutcomes } from '$lib/data/deployWindow';
import type { Promotion } from './promoteStaging';

export const noRepositoryToDeploy = 'This project has no repository recorded, so there is nothing to deploy.';

/** What a promotion did, as one sentence for the person who asked for it. */
export function describePromotion(promotion: Promotion): string {
	if (promotion.outcome === deployWindowOutcomes.opened) return `Opened ${promotion.pullRequestUrl}. ${promotion.note}`;
	if (promotion.outcome === deployWindowOutcomes.reused) return `${promotion.pullRequestUrl} was already open. ${promotion.note}`;
	return promotion.note;
}
