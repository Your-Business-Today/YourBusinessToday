import { isPlainObject, type PlainObject } from '$lib/data/plainObject';
import { domainFilingLimits, domainReferenceType, type DomainFactsGiven } from '$lib/data/businessBrainDomainRules';
import { isPageSlug, lengthRefusal, slugRefusal } from './businessBrainFieldRefusals';
import { trimmedText } from '$lib/data/trimmedText';
import type { DomainFieldFact } from '$lib/data/businessBrainDomain';

const { mostFields, longestFieldName, longestFieldLabel, longestFieldType, longestFieldNotes, mostStatuses, longestStatus } =
	domainFilingLimits;

export const fieldsRefusal = `The fields are a list of at most ${mostFields}, each with a name and a type.`;

export const statusesRefusal = `The statuses are a list of at most ${mostStatuses} words, each at most ${longestStatus} characters.`;

/** An entity's fields, statuses and aggregate root as given, or a sentence naming the first that does not fit. */
export function validateDomainFacts(entry: PlainObject, label: string): DomainFactsGiven | string {
	const fields = validateFields(entry.fields, label);
	if (typeof fields === 'string') return fields;
	const statuses = validateStatuses(entry.statuses);
	if (statuses === null) return `${label}: ${statusesRefusal}`;
	const aggregateRootSlug = trimmedText(entry.aggregateRootSlug);
	const isRootNamed = aggregateRootSlug !== '';
	if (isRootNamed && !isPageSlug(aggregateRootSlug)) return `${label}: aggregateRootSlug. ${slugRefusal}`;
	return { fields, statuses, aggregateRootSlug: isRootNamed ? aggregateRootSlug : null };
}

function validateFields(given: unknown, label: string): DomainFieldFact[] | string {
	if (given === undefined) return [];
	if (!Array.isArray(given) || given.length > mostFields) return `${label}: ${fieldsRefusal}`;
	const fields: DomainFieldFact[] = [];
	for (const [index, field] of given.entries()) {
		const checked = validateField(isPlainObject(field) ? field : {}, `${label}, field ${index + 1}`);
		if (typeof checked === 'string') return checked;
		fields.push(checked);
	}
	return fields;
}

function validateField(field: PlainObject, label: string): DomainFieldFact | string {
	const name = trimmedText(field.name);
	const type = trimmedText(field.type);
	const notes = trimmedText(field.notes);
	const fieldLabel = trimmedText(field.label) || name;
	const refusal =
		lengthRefusal('name', name, longestFieldName, true) ??
		lengthRefusal('type', type, longestFieldType, true) ??
		lengthRefusal('label', fieldLabel, longestFieldLabel, false) ??
		lengthRefusal('notes', notes, longestFieldNotes, false);
	if (refusal !== null) return `${label}: ${refusal}`;
	const ref = validateReference(type, trimmedText(field.ref));
	if (ref === undefined) return `${label}: a field of type ${domainReferenceType} names the entity it refers to by its slug in ref. ${slugRefusal}`;
	return { name, label: fieldLabel, type, ref, isRequired: field.isRequired === true, notes };
}

function validateReference(type: string, ref: string): string | null | undefined {
	if (type !== domainReferenceType) return null;
	return isPageSlug(ref) ? ref : undefined;
}

function validateStatuses(given: unknown): string[] | null {
	if (given === undefined) return [];
	if (!Array.isArray(given) || given.length > mostStatuses) return null;
	const statuses = given.map(trimmedText);
	const isEveryStatusFitting = statuses.every((status) => status !== '' && status.length <= longestStatus);
	return isEveryStatusFitting ? statuses : null;
}
