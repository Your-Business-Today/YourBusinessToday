import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
import type { ChatbotPageGiven } from '$lib/data/businessBrainChatbotTrailRules';

/** Where a page a reading gave back is read on the site: as it now reads, or the earlier version that was given. */
export function pageGivenHref(addresses: BusinessBrainAddresses, page: ChatbotPageGiven): string {
	const { pageId, revisionId } = page;
	if (revisionId === null) return addresses.page(pageId);
	return addresses.revision(pageId, revisionId);
}
