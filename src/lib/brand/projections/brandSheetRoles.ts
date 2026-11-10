import type { TraitDefinition } from '../traits/traitDefinition';

export const notSaidInTheKit = 'Not said in the kit';

const neverForByTrait: Record<string, string> = {
	'look.colour.primary': 'Body text, or a fill behind running text',
	'look.colour.secondary': 'The one call to action, or anything placed to compete with the primary',
	'look.colour.accent': 'Decoration, or a second thing to look at in the same view',
	'look.colour.surface': 'Text',
	'look.colour.ink': 'A fill behind content',
	'look.colour.mutedInk': 'Text a person must read to act',
	'look.colour.captionText': 'Anything but burnt-in captions on video',
	'look.colour.captionBackground': 'Anything but the band behind burnt-in captions on video'
};

/** What a colour is never for, from the catalogue's own purpose; a brand's own colour has none until it is said. */
export function neverForOf(trait: TraitDefinition): string {
	return neverForByTrait[trait.key] ?? notSaidInTheKit;
}
