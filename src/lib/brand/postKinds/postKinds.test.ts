import { describe, expect, it } from 'vitest';
import { adoptedDecision } from '../testing/decisionFixture';
import { builtInTraits } from '../traits/traitCatalogue';
import { checkDecision } from '../decisions/checkDecision';
import { checkPostKind, checkPostKindIfGiven } from './checkPostKind';
import { findMedium } from '../mediums/mediumCatalogue';
import { postKindsOnOfferOf, postKindsTraitKey, starterPostKinds } from './postKinds';
import { resolveBrand } from '../resolution/resolveBrand';
import type { Decision } from '../decisions/decision';
import type { Medium } from '../mediums/mediumDefinition';

const facebookPost = findMedium('image.post.facebook') as Medium;
const dentistKinds = ['patient story', 'Tip', 'meet the team'];

function offerFor(decisions: Decision[]) {
	return postKindsOnOfferOf(resolveBrand(decisions, builtInTraits, facebookPost));
}

describe('a brand’s kinds of post', () => {
	it('are a list in the brand’s kit, kept like any other decision', () => {
		const check = checkDecision({ traitKey: postKindsTraitKey, mediumPath: 'all', value: dentistKinds }, builtInTraits);
		expect(check).toEqual({ decision: { traitKey: 'voice.postKinds', mediumPath: 'all', value: dentistKinds } });
	});

	it('are the brand’s own once it keeps them, and the starter list, which names no trade, until then', () => {
		expect(offerFor([adoptedDecision(postKindsTraitKey, 'all', dentistKinds)])).toEqual({ kinds: dentistKinds, isStarterList: false });
		expect(offerFor([])).toEqual({ kinds: starterPostKinds, isStarterList: true });
		expect(starterPostKinds).toContain('before and after');
	});

	it('take a kind the brand keeps in the brand’s own spelling, and refuse one it does not by name', () => {
		const offer = offerFor([adoptedDecision(postKindsTraitKey, 'all', dentistKinds)]);
		expect(checkPostKind(' tip ', offer)).toEqual({ kind: 'Tip' });
		expect(checkPostKind('before and after', offer)).toEqual({
			problem: '“before and after” is not a kind of post this brand keeps: give one of patient story, Tip, meet the team'
		});
		expect(checkPostKind(3, offer)).toEqual({ problem: 'kind is words, not number' });
		expect(checkPostKind('', offer)).toMatchObject({ problem: expect.stringContaining('kind is missing') });
	});

	it('say where to keep the brand’s own while it offers the starter list', () => {
		const answer = checkPostKind('dish of the week', offerFor([]));
		expect(answer).toMatchObject({ problem: expect.stringContaining('it keeps none of its own yet') });
		expect(answer).toMatchObject({ problem: expect.stringContaining('record its own as voice.postKinds') });
	});

	it('let a kind be left out only where the piece already has one', () => {
		expect(checkPostKindIfGiven(undefined, offerFor([]))).toEqual({ kind: null });
		expect(checkPostKindIfGiven('review', offerFor([]))).toEqual({ kind: 'review' });
	});
});
