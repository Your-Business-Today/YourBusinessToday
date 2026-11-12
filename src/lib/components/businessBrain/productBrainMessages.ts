import type { BusinessBrainPartKind } from '$lib/data/businessBrainRules';

const nothingTiedYet =
	"No part of the organisation's Your Business Brain is tied to this product yet. A manager ties parts through the connector with change_product_brain.";

const tiedPartsHoldNothing = 'The parts of the brain tied to this product hold no pages yet.';

/** What the product brain panel says when it lists no page. */
export function productBrainEmptyMessage(parts: BusinessBrainPartKind[]): string {
	const isAnythingTied = parts.length > 0;
	return isAnythingTied ? tiedPartsHoldNothing : nothingTiedYet;
}
