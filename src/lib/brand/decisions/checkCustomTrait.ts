import { builtInTraits } from '../traits/traitCatalogue';
import { isFacetKey } from '../facets';
import { isTraitKind } from '../values/traitValue';
import type { TraitDefinition } from '../traits/traitDefinition';

const customKeyPattern = /^[a-z]+(?:\.[a-zA-Z0-9]+)+$/;
const labelCharacters = 80;
const purposeCharacters = 300;
const mostChoices = 20;
const choiceCharacters = 60;

export type CustomTraitDraft = {
	facet: string;
	name: string;
	kind: string;
	label: string;
	purpose: string;
	choices: string[];
};

export type CustomTraitCheck = { trait: TraitDefinition } | { problem: string };

export function checkCustomTrait(draft: CustomTraitDraft): CustomTraitCheck {
	if (!isFacetKey(draft.facet)) return { problem: `${draft.facet} is not a facet` };
	const key = `${draft.facet}.${draft.name}`;
	if (!customKeyPattern.test(key)) return { problem: 'name it in words joined by dots, such as colour.seasonal' };
	if (builtInTraits.some((trait) => trait.key === key)) return { problem: `${key} is already a trait` };
	if (!isTraitKind(draft.kind) || draft.kind === 'actionRule') {
		return { problem: `${draft.kind} is not a kind a custom trait can take` };
	}
	if (draft.kind === 'choice' && draft.choices.length === 0) return { problem: 'a choice needs choices' };
	if (draft.choices.length > mostChoices || draft.choices.some((choice) => choice.length > choiceCharacters)) {
		return { problem: `up to ${mostChoices} choices of up to ${choiceCharacters} characters each` };
	}
	if (draft.label === '' || draft.label.length > labelCharacters) {
		return { problem: `give it a label of up to ${labelCharacters} characters` };
	}
	if (draft.purpose.length > purposeCharacters) {
		return { problem: `keep the purpose to ${purposeCharacters} characters` };
	}
	const { facet, kind, label, purpose, choices } = draft;
	return { trait: { key, facet, kind, label, purpose, choices, isCustom: true } };
}
