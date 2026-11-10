import { traitsOf } from './traitDefinition';

export const lookTraits = traitsOf('look', {
	'colour.primary': { kind: 'colour', label: 'Primary colour', purpose: 'The colour people know the brand by' },
	'colour.secondary': { kind: 'colour', label: 'Secondary colour', purpose: 'Supports the primary; never competes with it' },
	'colour.accent': { kind: 'colour', label: 'Accent colour', purpose: 'The one thing to look at — a call to action, a highlight' },
	'colour.surface': { kind: 'colour', label: 'Surface colour', purpose: 'Backgrounds, cards and end cards' },
	'colour.ink': { kind: 'colour', label: 'Ink colour', purpose: 'Text on the surface' },
	'colour.mutedInk': { kind: 'colour', label: 'Muted ink', purpose: 'Secondary text and small print' },
	'colour.captionText': { kind: 'colour', label: 'Caption text', purpose: 'Burnt-in captions on video' },
	'colour.captionBackground': { kind: 'colour', label: 'Caption background', purpose: 'Behind burnt-in captions' },
	'type.displayFamily': { kind: 'fontFamily', label: 'Display typeface', purpose: 'Headlines, hooks and titles' },
	'type.bodyFamily': { kind: 'fontFamily', label: 'Body typeface', purpose: 'Running text and captions' },
	'type.displayWeight': { kind: 'fontWeight', label: 'Display weight', purpose: 'How heavy headlines are' },
	'type.bodyWeight': { kind: 'fontWeight', label: 'Body weight', purpose: 'How heavy running text is' },
	'type.captionSize': { kind: 'length', label: 'Caption size', purpose: 'The size of burnt-in captions' },
	'type.lineHeight': { kind: 'number', label: 'Line height', purpose: 'Spacing between lines, as a multiple of the size' },
	'shape.radius': { kind: 'length', label: 'Corner radius', purpose: 'How round cards, buttons and frames are' },
	'shape.borderWidth': { kind: 'length', label: 'Border width', purpose: 'The weight of every outline' },
	'shape.borderStyle': { kind: 'choice', label: 'Border style', purpose: 'How outlines are drawn', choices: ['solid', 'dashed', 'dotted', 'none'] },
	'shape.shadow': { kind: 'choice', label: 'Shadow', purpose: 'How things lift off the surface', choices: ['none', 'soft', 'hard'] },
	'space.unit': { kind: 'length', label: 'Spacing unit', purpose: 'The step every gap and margin is a multiple of' },
	'imagery.style': { kind: 'phrase', label: 'Imagery style', purpose: 'What the brand’s photos and footage look like' },
	'logo.placement': { kind: 'choice', label: 'Logo placement', purpose: 'Where the logo sits', choices: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'end-card-only', 'none'] }
});
