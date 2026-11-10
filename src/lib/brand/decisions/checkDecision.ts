import { canExpressAnywhereWithin } from '../mediums/mediumExpression';
import { findMedium } from '../mediums/mediumCatalogue';
import { findTrait } from '../traits/traitCatalogue';
import { isRefused } from '../values/valueReading';
import { readTraitValue } from '../values/readTraitValue';
import type { CheckedDecision, DecisionDraft } from './decision';
import type { TraitDefinition } from '../traits/traitDefinition';

export type DecisionCheck = { decision: CheckedDecision } | { problem: string };

export function checkDecision(draft: DecisionDraft, catalogue: TraitDefinition[]): DecisionCheck {
	const trait = findTrait(catalogue, draft.traitKey);
	if (trait === null) return { problem: `${draft.traitKey} is not a trait this brand has` };
	const medium = findMedium(draft.mediumPath);
	if (medium === null) return { problem: `${draft.mediumPath} is not a medium` };
	if (!canExpressAnywhereWithin(medium, trait)) {
		return { problem: `${medium.label} cannot express ${trait.label.toLowerCase()}` };
	}
	const reading = readTraitValue(trait, draft.value);
	if (isRefused(reading)) return { problem: `${trait.label}: ${reading.problem}` };
	return { decision: { traitKey: trait.key, mediumPath: medium.path, value: reading.value } };
}
