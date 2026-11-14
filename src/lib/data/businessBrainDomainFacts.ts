import { filledTextsOf } from './filledText';
import { isPlainObject, type PlainObject } from './plainObject';
import { readAreaRelationships, readSubdomainKind } from './areaRelationshipFacts';
import { readDomainTerms } from './domainTermFacts';
import { readRecordFacts, readStatuses } from './domainRecordFacts';
import { readEventFacts, readRuleFacts } from './domainRuleFacts';
import type { DomainFieldFact, DomainPageFacts } from './businessBrainDomain';

const noFacts: DomainPageFacts = {
	isCoreDomain: false,
	subdomain: null,
	fields: [],
	statuses: [],
	aggregateRootSlug: null,
	governs: [],
	terms: [],
	relationships: [],
	identity: null,
	lifecycle: [],
	keptIn: null,
	memberSlugs: [],
	marksThingSlug: null,
	marksStatus: null,
	reactors: { roles: [], ruleSlugs: [] },
	ruleKind: null,
	guardsStationKeys: [],
	guardsThingSlug: null,
	guardsStatus: null,
	followsEventSlug: null,
	definesWord: null,
	assumed: []
};

/** A page's facts as the domain reads them; anything a page does not carry, or carries in another shape, reads as absent. */
export function readDomainPageFacts(facts: unknown): DomainPageFacts {
	if (!isPlainObject(facts)) return noFacts;
	const isCoreDomain = facts.isCoreDomain === true;
	const recordFacts = readRecordFacts(facts);
	return {
		...recordFacts,
		...readEventFacts(facts),
		...readRuleFacts(facts),
		isCoreDomain,
		subdomain: readSubdomainKind(isCoreDomain, facts.subdomain),
		fields: Array.isArray(facts.fields) ? facts.fields.filter(isPlainObject).filter(isNamed).map(fieldFact) : [],
		statuses: readStatuses(facts, recordFacts.lifecycle),
		aggregateRootSlug: isText(facts.aggregateRootSlug) ? facts.aggregateRootSlug : null,
		governs: Array.isArray(facts.governs) ? facts.governs.filter(isText) : [],
		terms: readDomainTerms(facts.terms),
		relationships: readAreaRelationships(facts.relationships),
		assumed: filledTextsOf(facts.assumed)
	};
}

function fieldFact(field: PlainObject): DomainFieldFact {
	const name = field.name as string;
	return {
		name,
		label: isText(field.label) ? field.label : name,
		type: isText(field.type) ? field.type : '',
		ref: isText(field.ref) ? field.ref : null,
		isRequired: field.isRequired === true,
		notes: isText(field.notes) ? field.notes : ''
	};
}

function isNamed(field: PlainObject): boolean {
	return isText(field.name) && field.name !== '';
}

function isText(value: unknown): value is string {
	return typeof value === 'string';
}
