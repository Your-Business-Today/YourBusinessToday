import type { FacetKey } from '../facets';
import type { TraitKind } from '../values/traitValue';

export type TraitDefinition = {
	key: string;
	facet: FacetKey;
	kind: TraitKind;
	label: string;
	purpose: string;
	choices?: string[];
	actionKey?: string;
	isCustom?: boolean;
};

type TraitShape = Omit<TraitDefinition, 'key' | 'facet'>;

export function traitsOf(facet: FacetKey, shapes: Record<string, TraitShape>): TraitDefinition[] {
	return Object.entries(shapes).map(([name, shape]) => ({ key: `${facet}.${name}`, facet, ...shape }));
}
