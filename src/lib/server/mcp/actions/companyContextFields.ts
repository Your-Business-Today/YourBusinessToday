import { companyContextLimits as limits } from '$lib/data/companyContext/companyContextLimits';
import {
	confidenceLevels,
	contextLinkKinds,
	contextPartKinds,
	contextStages,
	reviewStates
} from '$lib/data/companyContext/companyContext';
import { objectSchema, textField } from '../actionTypes';

const choiceField = (choices: readonly string[], description: string) => ({
	type: 'string',
	enum: [...choices],
	description
});

const stepSchema = objectSchema(
	{
		does: textField(`What happens at this step, at most ${limits.stepLength} characters`),
		roleKey: textField('The key of the role that does it, when known')
	},
	['does']
);

const partSchema = objectSchema(
	{
		key: textField(
			`Your own key for the part, lower-case words joined by hyphens, at most ${limits.keyLength} characters; keep it the same in every version`
		),
		kind: choiceField(
			contextPartKinds,
			'context (an area of the business), source, record (a kind of record), process or role'
		),
		name: textField(`What the business calls it, at most ${limits.nameLength} characters`),
		description: textField(`What it is, at most ${limits.descriptionLength} characters`),
		isCore: {
			type: 'boolean',
			description: 'true on the one area of the business that is its core'
		},
		seenInConnector: textField(`The connector you saw it through, at most ${limits.connectorLength} characters`),
		seenAtPlace: textField(
			`Where in that connector, such as a folder or a mailbox, at most ${limits.placeLength} characters; never what it held`
		),
		confidence: choiceField(confidenceLevels, 'How sure you are of it'),
		reviewState: choiceField(Object.values(reviewStates), 'What the client said of it; not_checked until they have'),
		whatIsWrong: textField(
			`With not_right only: what the client said is wrong, at most ${limits.whatIsWrongLength} characters`
		),
		steps: {
			type: 'array',
			items: stepSchema,
			description: `A process's steps in order, at most ${limits.mostStepsInAProcess}`
		}
	},
	['key', 'kind', 'name', 'confidence']
);

const linkSchema = objectSchema(
	{
		fromKey: textField('The key of the part the link starts at'),
		kind: choiceField(
			contextLinkKinds,
			'creates (a source creates a record), is_created_by (a record is created by a role) or goes_next_to (a record goes next to a source or a process)'
		),
		toKey: textField('The key of the part the link ends at')
	},
	['fromKey', 'kind', 'toKey']
);

export const companyContextFields = {
	stage: choiceField(contextStages, 'The step of the offer the client is on, from map-data-sources onwards'),
	connectors: {
		type: 'array',
		items: { type: 'string' },
		description: `The connectors the client has switched on in Claude, at most ${limits.mostConnectors}`
	},
	parts: {
		type: 'array',
		items: partSchema,
		description: `Every part of the business you have worked out, at most ${limits.mostParts}`
	},
	links: {
		type: 'array',
		items: linkSchema,
		description: `What each source creates, who creates it and where it goes next, at most ${limits.mostLinks}`
	}
};
