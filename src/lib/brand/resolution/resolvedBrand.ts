import type { Medium } from '../mediums/mediumDefinition';
import type { TraitDefinition } from '../traits/traitDefinition';
import type { TraitValue } from '../values/traitValue';

export type ResolvedTrait = TraitDefinition & {
	value: TraitValue;
	decidedAt: string;
	decisionId: string;
};

export type ResolvedBrand = {
	medium: Medium;
	traits: ResolvedTrait[];
	gaps: TraitDefinition[];
	problems: string[];
};

export function resolvedValueOf(brand: ResolvedBrand, traitKey: string): TraitValue | null {
	return brand.traits.find((resolved) => resolved.key === traitKey)?.value ?? null;
}
