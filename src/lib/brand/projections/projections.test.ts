import { describe, expect, it } from 'vitest';
import { adoptedDecision } from '../testing/decisionFixture';
import { brandBriefOf } from './brandBrief';
import { builtInTraits } from '../traits/traitCatalogue';
import { cssVariablesOf, variableNameOf } from './cssVariables';
import { findMedium } from '../mediums/mediumCatalogue';
import { resolveBrand } from '../resolution/resolveBrand';
import type { Medium } from '../mediums/mediumDefinition';

const decisions = [
	adoptedDecision('look.shape.borderWidth', 'all', '2px'),
	adoptedDecision('voice.tone', 'all', 'warm and plain'),
	adoptedDecision('response.save', 'all', { stance: 'often', guidance: 'Say “save this”' })
];
const onReels = resolveBrand(decisions, builtInTraits, findMedium('video.short.reels') as Medium);

describe('projecting a resolved brand', () => {
	it('names a variable for each look and motion trait', () => {
		expect(variableNameOf('look.shape.borderWidth')).toBe('--brand-shape-border-width');
		expect(cssVariablesOf(onReels)).toEqual({ '--brand-shape-border-width': '2px' });
	});

	it('writes the voice and the actions into the brief', () => {
		const brief = brandBriefOf('Acme', onReels);
		expect(brief).toContain('Tone: warm and plain');
		expect(brief).toContain('Save: often — Say “save this”');
		expect(brief).toContain('Instagram Reels');
	});
});
