import { builtInTraits } from '../traits/traitCatalogue';
import { isFacetKey } from '../facets';
import { isTraitKind, TraitKinds, type TraitKind } from '../values/traitValue';
import { KitLimits } from '../kitLimits';
import type { TraitDefinition } from '../traits/traitDefinition';

const customKeyPattern = /^[a-z]+(?:\.[a-zA-Z0-9]+)+$/;
const {
	traitLabelCharacters: labelCharacters,
	traitPurposeCharacters: purposeCharacters,
	traitChoices: mostChoices,
	traitChoiceCharacters: choiceCharacters
} = KitLimits;

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
	const { facet, name, kind, label, purpose, choices } = draft;
	if (!isFacetKey(facet)) return { problem: `${facet} is not a facet` };
	const key = `${facet}.${name}`;
	if (!customKeyPattern.test(key)) return { problem: 'name it in words joined by dots, such as colour.seasonal' };
	if (key.length > KitLimits.traitKeyCharacters) {
		return { problem: `keep ${key} to ${KitLimits.traitKeyCharacters} characters, facet and name together` };
	}
	if (builtInTraits.some((trait) => trait.key === key)) return { problem: `${key} is already a trait` };
	if (!isCustomTraitKind(kind)) return { problem: `${kind} is not a kind a custom trait can take` };
	const isChoiceWithoutChoices = kind === TraitKinds.choice && choices.length === 0;
	if (isChoiceWithoutChoices) return { problem: 'a choice needs choices' };
	const hasOverlongChoice = choices.some((choice) => choice.length > choiceCharacters);
	if (choices.length > mostChoices || hasOverlongChoice) {
		return { problem: `up to ${mostChoices} choices of up to ${choiceCharacters} characters each` };
	}
	if (label === '' || label.length > labelCharacters) {
		return { problem: `give it a label of up to ${labelCharacters} characters` };
	}
	if (purpose.length > purposeCharacters) {
		return { problem: `keep the purpose to ${purposeCharacters} characters` };
	}
	return { trait: { key, facet, kind, label, purpose, choices, isCustom: true } };
}

function isCustomTraitKind(kind: string): kind is TraitKind {
	return isTraitKind(kind) && kind !== TraitKinds.actionRule;
}
