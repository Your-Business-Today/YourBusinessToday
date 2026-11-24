import { DecisionStatuses } from '$lib/brand/decisions/decision';
import type { BrandKit } from './loadBrandKit';

/**
 * A product's kit read over its organisation's, trait by trait: a trait the product has adopted
 * anything for is wholly the product's, and every other trait keeps the organisation's decisions.
 * The catalogue holds the traits either brand defined for itself.
 */
export function layerBrandKit(product: BrandKit, organisation: BrandKit): BrandKit {
	const productTraitKeys = new Set(product.catalogue.map((trait) => trait.key));
	const organisationOnlyTraits = organisation.catalogue.filter((trait) => !productTraitKeys.has(trait.key));
	const decidedByProduct = new Set(
		product.decisions.filter((decision) => decision.status === DecisionStatuses.adopted).map((decision) => decision.traitKey)
	);
	const inherited = organisation.decisions.filter((decision) => !decidedByProduct.has(decision.traitKey));
	return { catalogue: [...product.catalogue, ...organisationOnlyTraits], decisions: [...product.decisions, ...inherited] };
}
