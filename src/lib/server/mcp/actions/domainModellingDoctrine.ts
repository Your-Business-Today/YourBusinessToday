import { domainFilingLimits } from '$lib/data/businessBrainDomainRules';

const { mostPages } = domainFilingLimits;

/**
 * The modelling rules of the Your Brain Today domain brain, kept word for word where they still fit. They are
 * the doctrine on every action that files or reads a domain, and the walk of every domain run.
 */
export const domainModellingDoctrine = [
	'The domain is modelled in the discipline of domain-driven design: bounded contexts of entities, value objects, aggregates, domain services and domain events, with a glossary of each context’s language. You read the sources and do the modelling; Your Business Today keeps what you file and calls no AI model.',
	'Model concepts, never specimens. A source describes particular named things — one client, one job, one machine. See through the specimen to the concept it instantiates and write the concept’s page. The test for every page: would it belong in the model of ANY business doing this work? A named specimen is recorded as an example in a concept page’s "## Examples" section, in a line or two, and never grows into a page, a context or a glossary term of its own.',
	'Contexts partition the DOMAIN, never the sources: never one context per document, and never one named after a specimen. Most businesses need one to three.',
	'Exactly one context is the CORE DOMAIN, the heart of what the business does; mark it with isCoreDomain and move the mark as your understanding deepens.',
	'One page of kind context_map, slug context-map, says how the contexts relate: who feeds whom, what they share, where words change meaning.',
	'entity: a concept with identity that persists and changes. value_object: a concept defined only by its attributes. aggregate: a cluster treated as one unit; name its root in aggregateRootSlug. domain_service: an operation that belongs to no single entity. domain_event: an occurrence the business reacts to.',
	'rule: what must always be true about the things, the rule itself in one sentence as its title and why it holds as its body, in the context of the things it governs, naming them by slug in governs. A rule a source states or clearly implies is filed as a rule page of its own, never left in the wording of a thing’s page; a thing it governs is filed before it or in the same call.',
	'ONE glossary page per context, slug <context>-glossary: every term the business uses with a precise meaning, in its own words, each also given in terms as a word with its meaning, one to a row. Update it whenever a source uses words the glossary lacks.',
	'An entity’s fields and statuses go in fields and statuses, a reference to another entity as a field of type ref naming its slug, so the Domain tab can draw it.',
	'Check the domain before writing (read_business_brain_domain). If a page for the concept already exists under any plausible slug, write to that slug — near-duplicate pages are the failure that kills a model. A page written again takes the COMPLETE new body, existing knowledge kept and merged, never a fragment; the earlier version stays in its history.',
	'When pages already filed are specimens of a missing concept, or two pages are one concept, write the concept page and list the superseded pages in retires, each folded into a page written in the same call. Retiring is distillation, never deletion: the page leaves the domain, links to its successor and keeps its history.',
	'Slugs are kebab-case and permanent. Record only what the source states or clearly implies; never invent, never embellish.',
	`One call per source, touching at most ${mostPages} pages; prefer fewer, richer pages. A source that teaches the domain nothing is a valid outcome: file nothing.`
];
