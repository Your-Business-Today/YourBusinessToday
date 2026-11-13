import { businessBrainLimits } from '$lib/data/businessBrainRules';
import { contextMapSlug } from '$lib/data/businessBrainDomain';
import { domainFilingLimits, domainWritableKinds } from '$lib/data/businessBrainDomainRules';
import { everySubdomainKind } from '$lib/data/areaRelationshipFacts';
import { fieldEntry, lifecycleEntry, relationshipEntry, termEntry } from './businessBrainDomainFactEntries';
import { objectSchema, proseField, textField } from '../actionTypes';
import { organisationField, sourceNamingFields } from './businessBrainSchemas';

const { longestTitle, longestSummary, longestSlug } = businessBrainLimits;
const { mostContexts, mostPages, mostRetires, mostFields, mostStatuses, longestStatus } = domainFilingLimits;
const { mostGoverned, mostTerms, mostRelationships, longestIdentity, longestKeptIn, mostMembers } = domainFilingLimits;

const slugField = (what: string) => textField(`${what}: lower-case words joined by hyphens, permanent, at most ${longestSlug} characters`);

const contextEntry = objectSchema(
	{
		slug: slugField('The context’s slug, such as client-work; the Domain page calls a context an Area'),
		name: textField(`The context’s name in the business’s own words, a part of the business with its own words and records, at most ${longestTitle} characters`),
		summary: textField(`One line saying what model lives here, at most ${longestSummary} characters`),
		body: proseField('What the context covers and where its edges are; the summary stands in when left out'),
		isCoreDomain: { type: 'boolean', description: 'True only for the one context at the heart of the business' },
		subdomain: {
			type: 'string',
			enum: everySubdomainKind,
			description:
				'The part the context plays: core (what sets the business apart; the one context marked isCoreDomain), supporting (needed, and particular to the business) or generic (any business has it, such as invoicing)'
		}
	},
	['slug', 'name', 'summary']
);

const pageEntry = objectSchema(
	{
		kind: {
			type: 'string',
			enum: domainWritableKinds,
			description: 'Which building block the page is: on the Domain page an entity is a Record, a value_object a Detail, an aggregate a Group, a domain_service an Operation and a domain_event an Event'
		},
		slug: slugField(`The page’s slug; a slug already filed is revised, and the context map's is ${contextMapSlug}`),
		title: textField(
			`The concept in the business’s own word — a record a singular noun, an event the record first in the past tense, such as Contract stack signed — or for a rule the rule itself in one sentence, at most ${longestTitle} characters`
		),
		summary: textField(`One line that makes the index useful, at most ${longestSummary} characters`),
		body: proseField(
			'The COMPLETE page in the business’s own words, in the sections its kind carries: a record’s "## What makes one", "## Lifecycle", "## Kept in" and "## Examples", each also given as identity, lifecycle and keptIn; ' +
				'a detail’s unit or format; a group’s members and what stays true across it; an operation’s input, output and role; an event’s cause and who reacts; for a rule, why it holds'
		),
		contextSlug: textField('The bounded context the page lives in, by its slug; leave blank only for the context map'),
		fields: { type: 'array', items: fieldEntry, description: `Entity, value object or aggregate: its fields, at most ${mostFields}` },
		statuses: {
			type: 'array',
			items: { type: 'string' },
			description: `Entity: the statuses it moves through, each a describing word and never the record’s own name, at most ${mostStatuses}, each at most ${longestStatus} characters; taken from lifecycle when that is given`
		},
		lifecycle: { type: 'array', items: lifecycleEntry, description: `Entity: each status a row, with its meaning and the statuses it can move to, at most ${mostStatuses}` },
		identity: textField(`Entity: what brings one into being and what tells two apart, at most ${longestIdentity} characters`),
		keptIn: textField(`Entity: where the business keeps them — a product, a spreadsheet, the accounts package, paper — at most ${longestKeptIn} characters`),
		aggregateRootSlug: textField('Entity or aggregate: the slug of the entity at the root of the aggregate it belongs to'),
		memberSlugs: {
			type: 'array',
			items: { type: 'string' },
			description: `Aggregate: the records and details that change together with its root, by slug, at most ${mostMembers}; each filed before or in the same call, and in one group only`
		},
		governs: { type: 'array', items: { type: 'string' }, description: `Rule: the slugs of the things it governs, at least one and at most ${mostGoverned}` },
		terms: { type: 'array', items: termEntry, description: `Glossary: its words one to a row, at most ${mostTerms}, each saying what it names` },
		relationships: {
			type: 'array',
			items: relationshipEntry,
			description: `Context map: one row for each context that passes work or records to another, at most ${mostRelationships}`
		}
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
	pages: { type: 'array', items: pageEntry, description: `The pages this source demands, created or revised by slug, at most ${mostPages}; a source that teaches more is filed in several calls, the later ones giving the first call’s sourceId` },
	retires: { type: 'array', items: retireEntry, description: `The pages this modelling supersedes, at most ${mostRetires}` }
};

export const fileBusinessBrainDomainSchema = objectSchema({ organisationId: organisationField, ...filingFields }, ['organisationId']);

export const readBusinessBrainDomainSchema = objectSchema({ organisationId: organisationField }, ['organisationId']);
