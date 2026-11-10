import { describe, expect, it } from 'vitest';
import { captionRulesOf } from './captionRules';
import { problemWithCaption } from './checkCaptionFitsChannel';
import type { ResolvedBrand } from '../resolution/resolvedBrand';

const instagram = { channel: 'Instagram post', fewestHashtags: 3, mostHashtags: 5, isLinkInBio: true };
const facebook = { channel: 'Facebook post', fewestHashtags: 1, mostHashtags: 2, isLinkInBio: false };

function brandWith(values: Record<string, unknown>): ResolvedBrand {
	const traits = Object.entries(values).map(([key, value]) => ({ key, value }));
	return { medium: { label: 'Instagram post' }, traits, gaps: [], problems: [] } as unknown as ResolvedBrand;
}

describe('a caption kept to the brand’s decisions at its channel', () => {
	it('reads the hashtags and where the link goes from the kit at the channel', () => {
		const brand = brandWith({ 'voice.fewestHashtags': 3, 'voice.mostHashtags': 5, 'voice.linkPlacement': 'in the bio' });
		expect(captionRulesOf(brand)).toEqual(instagram);
	});

	it('decides nothing where the kit decides nothing', () => {
		expect(captionRulesOf(brandWith({}))).toEqual({ channel: 'Instagram post', fewestHashtags: null, mostHashtags: null, isLinkInBio: false });
	});

	it('takes a caption with the hashtags the channel wants and the link where it goes', () => {
		expect(problemWithCaption('Fire doors, fitted. Link in bio. #firesafety #doors #london', instagram)).toBeNull();
		expect(problemWithCaption('Fire doors, fitted: https://jewel.example #firesafety', facebook)).toBeNull();
	});

	it('refuses too few or too many hashtags, naming the decision', () => {
		expect(problemWithCaption('Fitted. #doors', instagram)).toContain('at least 3 on Instagram post (voice.fewestHashtags)');
		expect(problemWithCaption('Fitted. #a #b #c', facebook)).toContain('at most 2 on Facebook post (voice.mostHashtags)');
	});

	it('leaves a caption not written yet for later', () => {
		expect(problemWithCaption('', instagram)).toBeNull();
	});

	it('refuses a web address where the link goes in the bio', () => {
		expect(problemWithCaption('See www.jewel.example #a #b #c', instagram)).toContain('the link in the bio (voice.linkPlacement)');
	});
});
