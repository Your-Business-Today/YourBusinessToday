import { domainFilingLimits } from '$lib/data/businessBrainDomainRules';

const { mostPages } = domainFilingLimits;

/** What the domain is for, said at the top of every domain run and on every action that files one. */
export const domainPurpose =
	'The domain is detailed enough when a record’s screen could be built from its page and a new starter could do a task from its station.';

/**
 * The modelling rules of an organisation's own domain: one business modelled from its own workflow map and sources,
 * in the discipline of the Your Brain Today domain brain. They are the doctrine on every action that files or reads
 * a domain, and the walk of every domain run.
 */
export const domainModellingDoctrine = [
	'The domain is modelled in the discipline of domain-driven design: bounded contexts of entities, value objects, aggregates, domain services and domain events, with a glossary of each context’s language. You read the sources and do the modelling; Your Business Today keeps what you file and calls no AI model.',
	'With the person, use the words the Domain page uses: Area for a bounded context, Record for an entity, Detail for a value object, Group for an aggregate, Operation for a domain service, Event for a domain event, Rule for a rule and Word for a glossary term. Keep bounded context, entity and the rest for the filing.',
	'Model THIS business. The test for every page: is this a kind of thing this business handles, names and keeps track of? Its own kinds of thing are pages even when no other business has them, and the business’s own word for each comes first.',
	'Model concepts, never specimens. One named client, job or machine is an example of its concept: a line or two in that concept page’s "## Examples" section, never a page, a context or a glossary term of its own.',
	'Contexts partition the DOMAIN, never the sources: a context is a part of the business with its own words and its own records. Never one context per document, and never one named after a specimen.',
	'Exactly one context is the CORE DOMAIN, the heart of what the business does; mark it with isCoreDomain and move the mark as your understanding deepens. Give every context its subdomain: core (what sets the business apart), supporting (needed, and particular to the business) or generic (any business has it, such as invoicing).',
	'One page of kind context_map, slug context-map, says how the contexts relate: who feeds whom, what they share, where words change meaning. Its relationships give every pair of contexts that pass work or records a row: from which, to which, what passes, and whose terms win (customer_supplier, conformist, shared_kernel, anticorruption_layer or published_language). Both contexts are filed before it or in the same call.',
	'entity: a concept with identity that persists and changes. value_object: a concept defined only by its attributes. aggregate: a cluster treated as one unit; name its root in aggregateRootSlug. domain_service: an operation that belongs to no single entity. domain_event: an occurrence the business reacts to.',
	'Each page’s body carries the sections of its kind. A record (entity) says what it is, then "## What makes one", "## Lifecycle" (how it moves from status to status and what moves it), "## Kept in" and "## Examples". A detail (value object) gives its unit or format. A group (aggregate) says what belongs to it and what stays true across it. An operation (domain service) says what it takes, what it gives and which role runs it. An event (domain event) says what raises it and who reacts.',
	'Name things so the workflow map and the domain can be checked against each other. A record is a singular noun. A status is a describing word, never the record’s own name. A task starts with a verb. An event is the record first, in the past tense, such as "Contract stack signed". What a task takes in or produces is the record’s name with its status, such as "signed contract stack". A word has one meaning inside its context.',
	'rule: what must always be true about the things, the rule itself in one sentence as its title and why it holds as its body, in the context of the things it governs, naming them by slug in governs. A rule a source states or clearly implies is filed as a rule page of its own, never left in the wording of a thing’s page; a thing it governs is filed before it or in the same call.',
	'ONE glossary page per context, slug <context>-glossary: every term the business uses with a precise meaning, in its own words, each also given in terms as a word with its meaning, one to a row. Update it whenever a source uses words the glossary lacks.',
	'Give every word what it names, so the glossary ties the business’s language to its records: namesThingSlug for the thing it names, filed before it or in the same call, with namesStatus when it names that thing in one of its statuses ("signed contract stack" names contract-stack in Signed); isRole when it is a hat someone wears, an outside party or a system; and otherNames for the other words people use for it. A word that names none of these stays a plain word, and the person is asked about it.',
	'An entity’s fields and statuses go in fields and statuses, a reference to another entity as a field of type ref naming its slug, so the Domain tab can draw it.',
	'Check the domain before writing (read_business_brain_domain). If a page for the concept already exists under any plausible slug, write to that slug — near-duplicate pages are the failure that kills a model. A page written again takes the COMPLETE new body, existing knowledge kept and merged, never a fragment; the earlier version stays in its history.',
	'When pages already filed are specimens of a missing concept, or two pages are one concept, write the concept page and list the superseded pages in retires, each folded into a page written in the same call. Retiring is distillation, never deletion: the page leaves the domain, links to its successor and keeps its history.',
	'Slugs are kebab-case and permanent. Record only what the source states or clearly implies; never invent, never embellish.',
	'A page for every kind of thing the business keeps: a thin page that names a real thing beats a missing one, and the questions fill it in.',
	`One source to a call, touching at most ${mostPages} pages; a source that teaches more is filed in several calls, each later one naming the first call’s sourceId. A source that teaches the domain nothing is a valid outcome: file nothing.`
];
