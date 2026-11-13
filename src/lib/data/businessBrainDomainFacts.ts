import { isPlainObject, type PlainObject } from './plainObject';
import { readAreaRelationships, readSubdomainKind } from './areaRelationshipFacts';
import { readDomainTerms } from './domainTermFacts';
import type { DomainFieldFact, DomainPageFacts } from './businessBrainDomain';

const noFacts: DomainPageFacts = {
	isCoreDomain: false,
	subdomain: null,
	fields: [],
	statuses: [],
	aggregateRootSlug: null,
	governs: [],
	terms: [],
	relationships: []
};

/** A page's facts as the domain reads them; anything a page does not carry, or carries in another shape, reads as absent. */
export function readDomainPageFacts(facts: unknown): DomainPageFacts {
	if (!isPlainObject(facts)) return noFacts;
	const isCoreDomain = facts.isCoreDomain === true;
	return {
		isCoreDomain,
		subdomain: readSubdomainKind(isCoreDomain, facts.subdomain),
		fields: Array.isArray(facts.fields) ? facts.fields.filter(isPlainObject).filter(isNamed).map(fieldFact) : [],
		statuses: Array.isArray(facts.statuses) ? facts.statuses.filter(isText) : [],
		aggregateRootSlug: isText(facts.aggregateRootSlug) ? facts.aggregateRootSlug : null,
		governs: Array.isArray(facts.governs) ? facts.governs.filter(isText) : [],
		terms: readDomainTerms(facts.terms),
		relationships: readAreaRelationships(facts.relationships)
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
