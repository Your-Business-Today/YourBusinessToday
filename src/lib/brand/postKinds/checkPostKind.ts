import { postKindsTraitKey, type PostKindsOnOffer } from './postKinds';

/** The kind as the brand spells it, or why it cannot be kept. */
export type PostKindCheck = { kind: string } | { problem: string };

/** As PostKindCheck, with null for a kind left out where it may be. */
export type GivenPostKindCheck = { kind: string | null } | { problem: string };

const leftOutValues: unknown[] = [undefined, null, ''];

/** A piece's kind, which must be one the brand keeps; the brand's own spelling is the one kept. */
export function checkPostKind(given: unknown, offer: PostKindsOnOffer): PostKindCheck {
	if (typeof given !== 'string' && !leftOutValues.includes(given)) return { problem: `kind is words, not ${typeof given}` };
	const asked = typeof given === 'string' ? given.trim() : '';
	if (asked === '') return { problem: `kind is missing: ${onOfferOf(offer)}` };
	const kept = offer.kinds.find((kind) => kind.toLowerCase() === asked.toLowerCase());
	if (kept === undefined) return { problem: `“${asked}” is not a kind of post this brand keeps: ${onOfferOf(offer)}` };
	return { kind: kept };
}

/** As checkPostKind, but a kind left out keeps the one the piece already has. */
export function checkPostKindIfGiven(given: unknown, offer: PostKindsOnOffer): GivenPostKindCheck {
	if (leftOutValues.includes(given)) return { kind: null };
	return checkPostKind(given, offer);
}

function onOfferOf({ kinds, isStarterList }: PostKindsOnOffer): string {
	const listed = kinds.join(', ');
	if (!isStarterList) return `give one of ${listed}`;
	return (
		`it keeps none of its own yet, so give one of the starter list (${listed}), ` +
		`or record its own as ${postKindsTraitKey} with record_brand_decisions`
	);
}
