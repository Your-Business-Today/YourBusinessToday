import { postKindTraits } from '../traits/postKindTraits';
import { resolvedValueOf, type ResolvedBrand } from '../resolution/resolvedBrand';

const [postKindsTrait] = postKindTraits;

/** Where a brand keeps its kinds of post in its kit. */
export const postKindsTraitKey = postKindsTrait.key;

/** The kinds offered to a brand that keeps none of its own yet: Jewel's plan with the trade taken out. */
export const starterPostKinds = [
	'tip',
	'showcase',
	'before and after',
	'behind the scenes',
	'our story',
	'review',
	'who we help',
	'spotlight',
	'seasonal',
	'community',
	'why choose us'
];

/** The kinds a piece may be: the brand's own, or the starter list while it keeps none. */
export type PostKindsOnOffer = { kinds: string[]; isStarterList: boolean };

export function postKindsOnOfferOf(brand: ResolvedBrand): PostKindsOnOffer {
	const kept = resolvedValueOf(brand, postKindsTraitKey);
	if (!Array.isArray(kept)) return { kinds: starterPostKinds, isStarterList: true };
	return { kinds: kept, isStarterList: false };
}
