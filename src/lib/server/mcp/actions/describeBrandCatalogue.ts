import { everyAction } from '$lib/brand/actions/actionCatalogue';
import { facets } from '$lib/brand/facets';
import { mediums } from '$lib/brand/mediums/mediumCatalogue';
import { traitKinds } from '$lib/brand/values/traitValue';
import type { TraitDefinition } from '$lib/brand/traits/traitDefinition';

export function describeBrandCatalogue(catalogue: TraitDefinition[]): string {
	return [
		'Facets:\n' + facets.map((facet) => `- ${facet.key}: ${facet.question}`).join('\n'),
		'Traits (key [kind] — purpose):\n' + catalogue.map(traitLine).join('\n'),
		`Kinds: ${traitKinds.join(', ')}. A colour is hex, a length is px/rem/em/% or 0, a duration is ms or s, a phraseList is a list of strings, an actionRule is { stance: always|often|sometimes|never, guidance }, weekdays is a list of days named in full (Monday to Sunday), a timeOfDay is HH:MM on the 24-hour UK clock and a wholeNumber is 0 or more. Any single value may instead refer to another trait as {trait.key}.`,
		'Mediums (path — label: facets | actions):\n' + mediums.map(mediumLine).join('\n'),
		'Actions:\n' + everyAction.map((action) => `- ${action.key} (${action.actor}): ${action.description}`).join('\n')
	].join('\n\n');
}

function traitLine(trait: TraitDefinition): string {
	const choices = trait.choices === undefined ? '' : ` Choices: ${trait.choices.join(', ')}.`;
	const custom = trait.isCustom ? ' (this brand’s own)' : '';
	return `- ${trait.key} [${trait.kind}]${custom} — ${trait.purpose}.${choices}`;
}

function mediumLine(medium: (typeof mediums)[number]): string {
	return `- ${medium.path} — ${medium.label}: ${medium.facets.join(', ')} | ${medium.actions.join(', ')}`;
}
