import { isPlainObject, type PlainObject } from './plainObject';
import type { DomainFieldFact, DomainPageFacts, DomainTermFact } from './businessBrainDomain';

const noFacts: DomainPageFacts = { isCoreDomain: false, fields: [], statuses: [], aggregateRootSlug: null, governs: [], terms: [] };

/** A page's facts as the domain reads them; anything a page does not carry, or carries in another shape, reads as absent. */
export function readDomainPageFacts(facts: unknown): DomainPageFacts {
	if (!isPlainObject(facts)) return noFacts;
	return {
		isCoreDomain: facts.isCoreDomain === true,
		fields: Array.isArray(facts.fields) ? facts.fields.filter(isPlainObject).filter(isNamed).map(fieldFact) : [],
		statuses: Array.isArray(facts.statuses) ? facts.statuses.filter(isText) : [],
		aggregateRootSlug: isText(facts.aggregateRootSlug) ? facts.aggregateRootSlug : null,
		governs: Array.isArray(facts.governs) ? facts.governs.filter(isText) : [],
		terms: Array.isArray(facts.terms) ? facts.terms.filter(isPlainObject).filter(isWordAndMeaning).map(termFact) : []
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

function termFact(term: PlainObject): DomainTermFact {
	return { word: term.word as string, meaning: term.meaning as string };
}

function isWordAndMeaning(term: PlainObject): boolean {
	return isText(term.word) && term.word !== '' && isText(term.meaning);
}

function isNamed(field: PlainObject): boolean {
	return isText(field.name) && field.name !== '';
}

function isText(value: unknown): value is string {
	return typeof value === 'string';
}
