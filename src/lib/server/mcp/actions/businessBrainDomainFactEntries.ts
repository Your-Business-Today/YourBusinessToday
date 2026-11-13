import { domainFilingLimits, domainReferenceType } from '$lib/data/businessBrainDomainRules';
import { everyAreaRelationshipPattern } from '$lib/data/areaRelationshipFacts';
import { objectSchema, textField } from '../actionTypes';
import { patternMeanings } from '$lib/server/businessBrain/validateAreaRelationships';

const { longestFieldName, longestFieldType, longestWord, longestMeaning, longestStatus, mostOtherNames, longestPasses } = domainFilingLimits;

export const fieldEntry = objectSchema(
	{
		name: textField(`The field’s name, at most ${longestFieldName} characters`),
		label: textField('What a person calls it, when it differs from the name'),
		type: textField(`What it holds, such as text, number, money, date or ${domainReferenceType}, with its unit or format where it has one — at most ${longestFieldType} characters`),
		ref: textField(`With type ${domainReferenceType}: the slug of the entity it refers to`),
		isRequired: { type: 'boolean', description: 'True when every one of these has it' },
		notes: textField('Anything the name does not say')
	},
	['name', 'type']
);

export const termEntry = objectSchema(
	{
		word: textField(`The word as the business uses it, with one meaning inside its context, at most ${longestWord} characters`),
		meaning: textField(`What it means here, at most ${longestMeaning} characters`),
		namesThingSlug: textField('The slug of the thing the word names, such as contract-stack; the thing is filed before this word or in the same call'),
		namesStatus: textField(`With namesThingSlug: the status of that thing the word names, one of its statuses, such as Signed for "signed contract stack" — at most ${longestStatus} characters`),
		isRole: { type: 'boolean', description: 'True when the word is a role: a hat someone wears, an outside party or a system' },
		otherNames: { type: 'array', items: { type: 'string' }, description: `The other words people use for it, at most ${mostOtherNames}` }
	},
	['word', 'meaning']
);

export const relationshipEntry = objectSchema(
	{
		fromContextSlug: textField('The context that passes something on, by its slug'),
		toContextSlug: textField('The context that receives it, by its slug'),
		passes: textField(`What passes between them, in the business’s words, at most ${longestPasses} characters`),
		pattern: {
			type: 'string',
			enum: everyAreaRelationshipPattern,
			description: `Whose terms win: ${patternMeanings}`
		}
	},
	['fromContextSlug', 'toContextSlug', 'passes', 'pattern']
);
