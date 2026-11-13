import type { AreaRelationshipFact, DomainFieldFact, DomainLifecycleStep } from './businessBrainDomain';
import type { DomainEventReactors, RuleKind } from './domainRuleFacts';

/** What a record was given beyond its fields and statuses: only what was given is kept, so a page filed without them reads as it did. */
export type DomainRecordFactsGiven = { identity?: string; lifecycle?: DomainLifecycleStep[]; keptIn?: string; memberSlugs?: string[] };

/** The facts a thing written by a filing carries, as they are kept; its statuses are its lifecycle's when it has one. */
export type DomainFactsGiven = { fields: DomainFieldFact[]; statuses: string[]; aggregateRootSlug: string | null } & DomainRecordFactsGiven;

/** A rule's facts: the slugs of the things it governs, and, kept when given, its kind and where that kind sits. */
export type DomainRuleFactsGiven = {
	governs: string[];
	ruleKind?: RuleKind;
	guardsStationKeys?: string[];
	guardsThingSlug?: string;
	guardsStatus?: string;
	followsEventSlug?: string;
	definesWord?: string;
};

/** An event's facts, kept when given: the record and the status it reaches that the event marks, and who reacts. */
export type DomainEventFactsGiven = { marksThingSlug?: string; marksStatus?: string; reactors?: DomainEventReactors };

/** What a word was given beyond its meaning: only what it names, kept when given. */
export type DomainTermNamingGiven = { namesThingSlug?: string; namesStatus?: string; isRole?: boolean; otherNames?: string[] };

/** A word as it is kept: its meaning, and only what it names that was given. */
export type DomainTermGiven = { word: string; meaning: string } & DomainTermNamingGiven;

/** A glossary's facts: its words, one to a row. */
export type DomainGlossaryFactsGiven = { terms: DomainTermGiven[] };

/** The context map's facts: how the areas relate, one row for each area passing something to another. */
export type DomainContextMapFactsGiven = { relationships: AreaRelationshipFact[] };

/** The facts a page of any kind written by a filing carries. */
export type DomainPageFactsGiven =
	| DomainFactsGiven
	| DomainRuleFactsGiven
	| DomainEventFactsGiven
	| DomainGlossaryFactsGiven
	| DomainContextMapFactsGiven;
