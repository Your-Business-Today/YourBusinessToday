import { CaptionRuleKeys, type CaptionRules } from './captionRules';

const hashtagPattern = /#[\p{L}\p{N}_]+/gu;
const webAddressPattern = /\bhttps?:\/\/|\bwww\./i;

/** A caption's hashtags, each one a # followed by letters, digits or underscores. */
export function hashtagsIn(caption: string): string[] {
	return caption.match(hashtagPattern) ?? [];
}

export function hasWebAddress(caption: string): boolean {
	return webAddressPattern.test(caption);
}

const notWrittenYet = '';

/**
 * Why a caption does not keep to the brand's decisions at its channel, or null when it does or is not written yet.
 * The decisions are the kit's, named in the refusal, so the caption is rewritten to them rather than trimmed to fit.
 */
export function problemWithCaption(caption: string, rules: CaptionRules): string | null {
	if (caption === notWrittenYet) return null;
	const { channel, fewestHashtags, mostHashtags } = rules;
	const hashtagCount = hashtagsIn(caption).length;
	const isTooFew = fewestHashtags !== null && hashtagCount < fewestHashtags;
	if (isTooFew)
		return `caption carries ${hashtagCount} hashtags, and the brand puts at least ${fewestHashtags} on ${channel} (${CaptionRuleKeys.fewestHashtags})`;
	const isTooMany = mostHashtags !== null && hashtagCount > mostHashtags;
	if (isTooMany)
		return `caption carries ${hashtagCount} hashtags, and the brand puts at most ${mostHashtags} on ${channel} (${CaptionRuleKeys.mostHashtags})`;
	const isLinkMisplaced = rules.isLinkInBio && hasWebAddress(caption);
	if (isLinkMisplaced)
		return `caption carries a web address, and on ${channel} the brand puts the link in the bio (${CaptionRuleKeys.linkPlacement}): say so in its place`;
	return null;
}
