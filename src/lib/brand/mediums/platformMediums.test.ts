import { describe, expect, it } from 'vitest';
import { adoptedDecision } from '../testing/decisionFixture';
import { builtInTraits } from '../traits/traitCatalogue';
import { checkContentDraft } from '../content/checkContentDraft';
import { checkDecision } from '../decisions/checkDecision';
import { resolveBrand } from '../resolution/resolveBrand';
import { resolvedValueOf } from '../resolution/resolvedBrand';
import { findMedium } from './mediumCatalogue';
import type { Medium } from './mediumDefinition';

const platformMediums: Record<string, string> = {
	'image.post.facebook': 'image.post',
	'text.post.facebook': 'text.post',
	'image.story.instagram': 'image.story',
	'image.story.facebook': 'image.story',
	'image.carousel.instagram': 'image.carousel',
	'image.carousel.facebook': 'image.carousel',
	'image.carousel.linkedin': 'image.carousel'
};

const platformPaths = Object.keys(platformMediums);

const mediumAt = (path: string): Medium => findMedium(path) as Medium;

describe('Facebook, and a Story or a Carousel on a named platform', () => {
	it.each(platformPaths)('lists %s under the medium it belongs to', (path) => {
		expect(mediumAt(path).parentPath).toBe(platformMediums[path]);
	});

	it.each(platformPaths)('takes a decision made for %s', (path) => {
		const decision = checkDecision({ traitKey: 'voice.tone', mediumPath: path, value: 'warm' }, builtInTraits);
		expect(decision).toHaveProperty('decision');
	});

	it.each(platformPaths)('keeps a piece drafted for %s', (path) => {
		const check = checkContentDraft({ medium: path, title: 'Fire doors, plainly', invitedAction: 'share' });
		expect(check).toHaveProperty('draft');
	});

	it.each(platformPaths)('resolves the kit for %s through the medium above it', (path) => {
		const decisions = [
			adoptedDecision('voice.tone', 'all', 'plain'),
			adoptedDecision('voice.tone', platformMediums[path], 'warm')
		];
		const resolved = resolveBrand(decisions, builtInTraits, mediumAt(path));
		expect(resolvedValueOf(resolved, 'voice.tone')).toBe('warm');
	});

	it('lets a Story on one platform differ from a Story on another', () => {
		const decisions = [
			adoptedDecision('voice.tone', 'image.story', 'warm'),
			adoptedDecision('voice.tone', 'image.story.facebook', 'neighbourly')
		];
		const onInstagram = resolveBrand(decisions, builtInTraits, mediumAt('image.story.instagram'));
		const onFacebook = resolveBrand(decisions, builtInTraits, mediumAt('image.story.facebook'));
		expect(resolvedValueOf(onInstagram, 'voice.tone')).toBe('warm');
		expect(resolvedValueOf(onFacebook, 'voice.tone')).toBe('neighbourly');
	});
});
