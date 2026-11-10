import { traitsOf } from './traitDefinition';

export const audienceTraits = traitsOf('audience', {
	description: { kind: 'phrase', label: 'Who they are', purpose: 'The people the brand is for, in a sentence' },
	ageRange: { kind: 'phrase', label: 'Age range', purpose: 'How old they usually are' },
	locations: { kind: 'phraseList', label: 'Where they are', purpose: 'Places the audience lives or works' },
	languages: { kind: 'phraseList', label: 'Languages', purpose: 'Languages the brand speaks to them in' },
	motivations: { kind: 'phraseList', label: 'What they want', purpose: 'What brings them to the brand' },
	objections: { kind: 'phraseList', label: 'What holds them back', purpose: 'Why they might not buy' }
});
