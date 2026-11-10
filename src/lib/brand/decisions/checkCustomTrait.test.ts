import { describe, expect, it } from 'vitest';
import { checkCustomTrait, type CustomTraitDraft } from './checkCustomTrait';

const seasonalColour: CustomTraitDraft = {
	facet: 'look',
	name: 'colour.seasonal',
	kind: 'colour',
	label: 'Seasonal colour',
	purpose: 'The colour the brand wears for the season',
	choices: []
};

describe('checking a trait a brand defines for itself', () => {
	it('keys it by its facet and name, and marks it as the brand’s own', () => {
		const { facet, kind, label, purpose, choices } = seasonalColour;
		const trait = { key: 'look.colour.seasonal', facet, kind, label, purpose, choices, isCustom: true };
		expect(checkCustomTrait(seasonalColour)).toStrictEqual({ trait });
	});

	it('refuses a facet the catalogue does not have', () => {
		expect(checkCustomTrait({ ...seasonalColour, facet: 'smell' })).toEqual({ problem: 'smell is not a facet' });
	});

	it('refuses a trait the catalogue already has', () => {
		expect(checkCustomTrait({ ...seasonalColour, name: 'colour.accent' })).toEqual({
			problem: 'look.colour.accent is already a trait'
		});
	});

	it('refuses an action rule, which only the catalogue defines', () => {
		expect(checkCustomTrait({ ...seasonalColour, kind: 'actionRule' })).toEqual({
			problem: 'actionRule is not a kind a custom trait can take'
		});
	});

	it('refuses a choice with nothing to choose from', () => {
		expect(checkCustomTrait({ ...seasonalColour, kind: 'choice' })).toEqual({ problem: 'a choice needs choices' });
	});

	it('refuses a key longer than its column holds', () => {
		const overlongName = `colour.${'x'.repeat(120)}`;
		expect(checkCustomTrait({ ...seasonalColour, name: overlongName })).toHaveProperty('problem');
	});

	it('refuses a label longer than its limit', () => {
		const overlongLabel = 'x'.repeat(81);
		expect(checkCustomTrait({ ...seasonalColour, label: overlongLabel })).toEqual({
			problem: 'give it a label of up to 80 characters'
		});
	});
});
