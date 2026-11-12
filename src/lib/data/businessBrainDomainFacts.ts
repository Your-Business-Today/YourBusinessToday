import type { DomainFieldFact, DomainPageFacts } from './businessBrainDomain';

type Shape = Record<string, unknown>;

const noFacts: DomainPageFacts = { isCoreDomain: false, fields: [], statuses: [], aggregateRootSlug: null };

/** A page's facts as the domain reads them; anything a page does not carry, or carries in another shape, reads as absent. */
export function readDomainPageFacts(facts: unknown): DomainPageFacts {
	if (!isShape(facts)) return noFacts;
	return {
		isCoreDomain: facts.isCoreDomain === true,
		fields: Array.isArray(facts.fields) ? facts.fields.filter(isShape).filter(isNamed).map(fieldFact) : [],
		statuses: Array.isArray(facts.statuses) ? facts.statuses.filter(isText) : [],
		aggregateRootSlug: isText(facts.aggregateRootSlug) ? facts.aggregateRootSlug : null
	};
}

function fieldFact(field: Shape): DomainFieldFact {
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

function isShape(value: unknown): value is Shape {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNamed(field: Shape): boolean {
	return isText(field.name) && field.name !== '';
}

function isText(value: unknown): value is string {
	return typeof value === 'string';
}
