import { describe, expect, it } from 'vitest';
import { adoptedDecision } from '../testing/decisionFixture';
import { builtInTraits } from '../traits/traitCatalogue';
import { findMedium } from '../mediums/mediumCatalogue';
import { resolveBrand } from './resolveBrand';
import { resolvedValueOf } from './resolvedBrand';
import type { Medium } from '../mediums/mediumDefinition';

const mediumAt = (path: string): Medium => findMedium(path) as Medium;

const decisions = [
	adoptedDecision('look.shape.borderWidth', 'all', '2px'),
	adoptedDecision('look.shape.borderWidth', 'video.short', '0'),
	adoptedDecision('look.colour.accent', 'all', '#ff5a36'),
	adoptedDecision('look.colour.captionBackground', 'all', '{look.colour.accent}'),
	adoptedDecision('behaviour.stitch', 'all', { stance: 'never', guidance: 'Not competitors' })
];

describe('resolving a brand for a medium', () => {
	it('takes the deepest decision on the medium’s own branch', () => {
		const onTikTok = resolveBrand(decisions, builtInTraits, mediumAt('video.short.tiktok'));
		const onYouTube = resolveBrand(decisions, builtInTraits, mediumAt('video.long.youtube'));
		expect(resolvedValueOf(onTikTok, 'look.shape.borderWidth')).toBe('0');
		expect(resolvedValueOf(onYouTube, 'look.shape.borderWidth')).toBe('2px');
	});

	it('follows a reference to the value it names', () => {
		const onTikTok = resolveBrand(decisions, builtInTraits, mediumAt('video.short.tiktok'));
		expect(resolvedValueOf(onTikTok, 'look.colour.captionBackground')).toBe('#ff5a36');
	});

	it('leaves out what the medium cannot express', () => {
		const inEmail = resolveBrand(decisions, builtInTraits, mediumAt('text.email'));
		const onX = resolveBrand(decisions, builtInTraits, mediumAt('text.post.x'));
		expect(resolvedValueOf(inEmail, 'behaviour.stitch')).toBeNull();
		expect(resolvedValueOf(onX, 'look.colour.accent')).toBeNull();
		expect(inEmail.gaps.some((trait) => trait.facet === 'motion')).toBe(false);
	});

	it('keeps an action only where the medium offers it', () => {
		const onTikTok = resolveBrand(decisions, builtInTraits, mediumAt('video.short.tiktok'));
		expect(resolvedValueOf(onTikTok, 'behaviour.stitch')).toEqual({
			stance: 'never',
			guidance: 'Not competitors'
		});
	});

	it('reports a reference loop instead of following it', () => {
		const looping = [
			adoptedDecision('look.colour.primary', 'all', '{look.colour.secondary}'),
			adoptedDecision('look.colour.secondary', 'all', '{look.colour.primary}')
		];
		const resolved = resolveBrand(looping, builtInTraits, mediumAt('web.site'));
		expect(resolvedValueOf(resolved, 'look.colour.primary')).toBeNull();
		expect(resolved.problems[0]).toContain('loop');
	});

	it('ignores decisions that are only proposed', () => {
		const proposed = { ...adoptedDecision('voice.tone', 'all', 'warm'), status: 'proposed' as const };
		const resolved = resolveBrand([proposed], builtInTraits, mediumAt('web.site'));
		expect(resolvedValueOf(resolved, 'voice.tone')).toBeNull();
		expect(resolved.gaps.some((trait) => trait.key === 'voice.tone')).toBe(true);
	});
});
