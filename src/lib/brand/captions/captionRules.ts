import { LinkPlacements, captionTraits } from '../traits/captionTraits';
import { resolvedValueOf, type ResolvedBrand } from '../resolution/resolvedBrand';

const [fewestHashtagsTrait, mostHashtagsTrait, linkPlacementTrait] = captionTraits;

/** Where a brand keeps, at each channel, how many hashtags a caption carries and where the link goes. */
export const CaptionRuleKeys = {
	fewestHashtags: fewestHashtagsTrait.key,
	mostHashtags: mostHashtagsTrait.key,
	linkPlacement: linkPlacementTrait.key
} as const;

/** What a caption on one channel must keep to, as the brand's kit decides it there; null where nothing is decided. */
export type CaptionRules = {
	channel: string;
	fewestHashtags: number | null;
	mostHashtags: number | null;
	isLinkInBio: boolean;
};

export function captionRulesOf(brand: ResolvedBrand): CaptionRules {
	const fewestHashtags = resolvedValueOf(brand, CaptionRuleKeys.fewestHashtags);
	const mostHashtags = resolvedValueOf(brand, CaptionRuleKeys.mostHashtags);
	const linkPlacement = resolvedValueOf(brand, CaptionRuleKeys.linkPlacement);
	return {
		channel: brand.medium.label,
		fewestHashtags: typeof fewestHashtags === 'number' ? fewestHashtags : null,
		mostHashtags: typeof mostHashtags === 'number' ? mostHashtags : null,
		isLinkInBio: linkPlacement === LinkPlacements.bio
	};
}
