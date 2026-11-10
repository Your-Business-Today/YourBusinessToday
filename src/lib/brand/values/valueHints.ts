import type { TraitKind } from './traitValue';

export const valueHints: Record<TraitKind, string> = {
	colour: '#ff5a36, or {look.colour.primary}',
	length: '2px, 0.5rem or 0',
	duration: '250ms or 1.5s',
	easing: 'ease-out, or cubic-bezier(0.2, 0, 0, 1)',
	fontFamily: 'Space Grotesk',
	fontWeight: '400, 600, 700…',
	number: '1.4',
	ratio: '9:16',
	phrase: 'In a sentence',
	phraseList: 'One per line',
	choice: '',
	actionRule: 'When and how — within the hour, warmly, never with a link'
};
