import { mediumsWithin } from './mediumCatalogue';
import type { Medium } from './mediumDefinition';
import type { TraitDefinition } from '../traits/traitDefinition';

export function canExpress(medium: Medium, trait: TraitDefinition): boolean {
	if (!medium.facets.includes(trait.facet)) return false;
	if (trait.actionKey === undefined) return true;
	return medium.actions.includes(trait.actionKey);
}

export function canExpressAnywhereWithin(medium: Medium, trait: TraitDefinition): boolean {
	return mediumsWithin(medium.path).some((candidate) => canExpress(candidate, trait));
}
