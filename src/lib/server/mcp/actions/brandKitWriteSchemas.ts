import { DecisionStatuses } from '$lib/brand/decisions/decision';
import { facetKeys } from '$lib/brand/facets';
import { KitLimits } from '$lib/brand/kitLimits';
import { objectSchema, textField } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import { traitKinds, TraitKinds } from '$lib/brand/values/traitValue';

const { traitLabelCharacters, traitPurposeCharacters, traitChoices, traitChoiceCharacters } = KitLimits;
const customTraitKinds = traitKinds.filter((kind) => kind !== TraitKinds.actionRule);
const recordedStatuses = [DecisionStatuses.proposed, DecisionStatuses.adopted];

const decisionIdField = textField('The decision’s id, as read_brand or record_brand_decisions gives it');

const decisionEntry = objectSchema(
	{
		traitKey: textField('The trait decided, such as look.colour.accent, as read_brand_catalogue lists'),
		medium: textField('Where it holds: all, or a medium path such as video.short.tiktok'),
		value: {
			description:
				'The value, of the trait’s kind: a string or number for a single value, a list of strings for a phraseList, ' +
				'{ stance, guidance } for an actionRule, or {trait.key} to follow another trait'
		},
		rationale: textField(`Why the brand decides this, at most ${KitLimits.rationaleCharacters} characters`)
	},
	['traitKey', 'medium', 'value']
);

export const describeBrandSchema = objectSchema(
	{
		organisationId: organisationIdField,
		summary: textField(`What the brand is, in a sentence or two — at most ${KitLimits.summaryCharacters} characters`)
	},
	['organisationId', 'summary']
);

export const defineBrandTraitSchema = objectSchema(
	{
		organisationId: organisationIdField,
		facet: { type: 'string', enum: [...facetKeys], description: 'The facet the trait belongs to' },
		name: textField('The trait’s name within its facet, in words joined by dots, such as colour.seasonal'),
		kind: { type: 'string', enum: customTraitKinds, description: 'What kind of value a decision on it holds' },
		label: textField(`What the trait is called, at most ${traitLabelCharacters} characters`),
		purpose: textField(`What the trait is for, at most ${traitPurposeCharacters} characters`),
		choices: {
			type: 'array',
			items: { type: 'string' },
			description: `For a choice: up to ${traitChoices} choices of up to ${traitChoiceCharacters} characters each`
		}
	},
	['organisationId', 'facet', 'name', 'kind', 'label']
);

export const recordBrandDecisionsSchema = objectSchema(
	{
		organisationId: organisationIdField,
		status: {
			type: 'string',
			enum: recordedStatuses,
			description: 'adopted puts them in force; proposed leaves them for a person on the organisation to adopt'
		},
		decisions: { type: 'array', items: decisionEntry, description: `Up to ${KitLimits.decisionsPerCall} decisions` }
	},
	['organisationId', 'status', 'decisions']
);

export const decisionOnlySchema = objectSchema(
	{ organisationId: organisationIdField, decisionId: decisionIdField },
	['organisationId', 'decisionId']
);
