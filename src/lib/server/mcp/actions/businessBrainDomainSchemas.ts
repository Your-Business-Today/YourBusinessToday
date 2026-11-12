import { businessBrainLimits } from '$lib/data/businessBrainRules';
import { contextMapSlug } from '$lib/data/businessBrainDomain';
import { domainFilingLimits, domainReferenceType, domainWritableKinds } from '$lib/data/businessBrainDomainRules';
import { objectSchema, proseField, textField } from '../actionTypes';
import { organisationField, sourceNamingFields } from './businessBrainSchemas';
import { productField } from './productBrainSchemas';

const { longestTitle, longestSummary, longestSlug } = businessBrainLimits;
const { mostContexts, mostPages, mostRetires, mostFields, longestFieldName, longestFieldType, mostStatuses, longestStatus } = domainFilingLimits;

const slugField = (what: string) => textField(`${what}: lower-case words joined by hyphens, permanent, at most ${longestSlug} characters`);

const contextEntry = objectSchema(
	{
		slug: slugField('The context’s slug, such as client-work'),
		name: textField(`The context’s name in the business’s own language, at most ${longestTitle} characters`),
		summary: textField(`One line saying what model lives here, at most ${longestSummary} characters`),
		body: proseField('What the context covers and where its edges are; the summary stands in when left out'),
		isCoreDomain: { type: 'boolean', description: 'True only for the one context at the heart of the business' }
	},
	['slug', 'name', 'summary']
);

const fieldEntry = objectSchema(
	{
		name: textField(`The field’s name, at most ${longestFieldName} characters`),
		label: textField('What a person calls it, when it differs from the name'),
		type: textField(`What it holds, such as text, number, money, date or ${domainReferenceType} — at most ${longestFieldType} characters`),
		ref: textField(`With type ${domainReferenceType}: the slug of the entity it refers to`),
		isRequired: { type: 'boolean', description: 'True when every one of these has it' },
		notes: textField('Anything the name does not say')
	},
	['name', 'type']
);

const pageEntry = objectSchema(
	{
		kind: { type: 'string', enum: domainWritableKinds, description: 'Which building block the page is' },
		slug: slugField(`The page’s slug; a slug already filed is revised, and the context map's is ${contextMapSlug}`),
		title: textField(`The concept, at most ${longestTitle} characters`),
		summary: textField(`One line that makes the index useful, at most ${longestSummary} characters`),
		body: proseField('The COMPLETE page: the concept in the business’s own words, with an "## Examples" section for named specimens'),
		contextSlug: textField('The bounded context the page lives in, by its slug; leave blank only for the context map'),
		fields: { type: 'array', items: fieldEntry, description: `Entity, value object or aggregate: its fields, at most ${mostFields}` },
		statuses: { type: 'array', items: { type: 'string' }, description: `Entity: the statuses it moves through, at most ${mostStatuses}, each at most ${longestStatus} characters` },
		aggregateRootSlug: textField('Entity or aggregate: the slug of the entity at the root of the aggregate it belongs to')
	},
	['kind', 'slug', 'title', 'summary', 'body']
);

const retireEntry = objectSchema(
	{
		slug: textField('A page this modelling supersedes, by its slug'),
		foldedIntoSlug: textField('The page written in this same call that took its knowledge in')
	},
	['slug', 'foldedIntoSlug']
);

const filingFields = {
	...sourceNamingFields,
	contexts: { type: 'array', items: contextEntry, description: `The bounded contexts this source creates or reshapes, at most ${mostContexts}` },
	pages: { type: 'array', items: pageEntry, description: `The pages this source demands, created or revised by slug, at most ${mostPages}` },
	retires: { type: 'array', items: retireEntry, description: `The pages this modelling supersedes, at most ${mostRetires}` }
};

export const fileBusinessBrainDomainSchema = objectSchema({ organisationId: organisationField, ...filingFields }, ['organisationId']);

export const fileProductBrainDomainSchema = objectSchema({ projectId: productField, ...filingFields }, ['projectId']);

export const readBusinessBrainDomainSchema = objectSchema({ organisationId: organisationField }, ['organisationId']);

export const readProductBrainDomainSchema = objectSchema({ projectId: productField }, ['projectId']);
