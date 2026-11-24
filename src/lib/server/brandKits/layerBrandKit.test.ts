import { describe, expect, it } from 'vitest';
import { adoptedDecision } from '$lib/brand/testing/decisionFixture';
import { builtInTraits } from '$lib/brand/traits/traitCatalogue';
import { layerBrandKit } from './layerBrandKit';
import type { TraitDefinition } from '$lib/brand/traits/traitDefinition';

const accent = 'look.colour.accent';
const primary = 'look.colour.primary';
const seasonal: TraitDefinition = { key: 'look.colour.seasonal', facet: 'look', kind: 'colour', label: 'Seasonal', purpose: '', isCustom: true };

describe('a product’s brand read over its organisation’s', () => {
	it('takes the product’s decisions for a trait it has decided, everywhere, and none of the organisation’s', () => {
		const product = { catalogue: builtInTraits, decisions: [adoptedDecision(accent, 'all', '#ff5a1f')] };
		const organisation = {
			catalogue: builtInTraits,
			decisions: [adoptedDecision(accent, 'all', '#e63946'), adoptedDecision(accent, 'web', '#000000')]
		};
		const layered = layerBrandKit(product, organisation);
		expect(layered.decisions.filter((decision) => decision.traitKey === accent).map((decision) => decision.value)).toEqual(['#ff5a1f']);
	});

	it('keeps the organisation’s decisions for every trait the product leaves undecided', () => {
		const product = { catalogue: builtInTraits, decisions: [adoptedDecision(accent, 'all', '#ff5a1f')] };
		const organisation = { catalogue: builtInTraits, decisions: [adoptedDecision(primary, 'all', '#121416')] };
		const layered = layerBrandKit(product, organisation);
		expect(layered.decisions.map((decision) => decision.traitKey)).toEqual([accent, primary]);
	});

	it('holds the traits either brand defined for itself, each once', () => {
		const product = { catalogue: builtInTraits, decisions: [] };
		const organisation = { catalogue: [...builtInTraits, seasonal], decisions: [] };
		const keys = layerBrandKit(product, organisation).catalogue.map((trait) => trait.key);
		expect(keys).toContain(seasonal.key);
		expect(new Set(keys).size).toBe(keys.length);
	});
});
