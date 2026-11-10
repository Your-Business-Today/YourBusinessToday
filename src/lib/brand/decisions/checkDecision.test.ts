import { describe, expect, it } from 'vitest';
import { builtInTraits } from '../traits/traitCatalogue';
import { checkDecision } from './checkDecision';

const check = (traitKey: string, mediumPath: string, value: unknown) =>
	checkDecision({ traitKey, mediumPath, value }, builtInTraits);

describe('checking a decision at the door', () => {
	it('accepts a well-formed value and normalises a colour', () => {
		expect(check('look.colour.accent', 'all', '#FF5A36')).toEqual({
			decision: { traitKey: 'look.colour.accent', mediumPath: 'all', value: '#ff5a36' }
		});
	});

	it('refuses a value that does not fit the trait’s kind', () => {
		expect(check('look.shape.borderWidth', 'all', 'thick')).toHaveProperty('problem');
		expect(check('look.type.displayWeight', 'all', '450')).toHaveProperty('problem');
		expect(check('motion.pacing', 'all', 'glacial')).toHaveProperty('problem');
	});

	it('refuses a trait or medium that does not exist', () => {
		expect(check('look.colour.sparkle', 'all', '#fff')).toHaveProperty('problem');
		expect(check('look.colour.accent', 'video.hologram', '#fff')).toHaveProperty('problem');
	});

	it('refuses a facet the medium cannot express anywhere on its branch', () => {
		expect(check('motion.pacing', 'image.post', 'calm')).toHaveProperty('problem');
		expect(check('look.colour.accent', 'text', '#fff')).toHaveProperty('decision');
	});

	it('refuses an action the medium never offers', () => {
		const rule = { stance: 'often', guidance: '' };
		expect(check('behaviour.stitch', 'text.email', rule)).toHaveProperty('problem');
		expect(check('behaviour.stitch', 'video.short', rule)).toHaveProperty('decision');
	});

	it('reads a phrase list from lines of text', () => {
		expect(check('voice.wordsToAvoid', 'all', 'cheap\n\n synergy ')).toEqual({
			decision: { traitKey: 'voice.wordsToAvoid', mediumPath: 'all', value: ['cheap', 'synergy'] }
		});
	});

	it('accepts a reference in place of a value', () => {
		expect(check('look.colour.ink', 'all', '{look.colour.primary}')).toHaveProperty('decision');
	});
});
