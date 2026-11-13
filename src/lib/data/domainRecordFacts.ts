import { isPlainObject, type PlainObject } from './plainObject';
import { isFilledText } from './filledText';
import type { DomainLifecycleStep, DomainRecordFacts } from './businessBrainDomain';

/** What a record's facts say of it beyond its fields; a page filed before records said these reads as saying none of them. */
export function readRecordFacts(facts: PlainObject): DomainRecordFacts {
	return {
		identity: isFilledText(facts.identity) ? facts.identity : null,
		lifecycle: readLifecycle(facts.lifecycle),
		keptIn: isFilledText(facts.keptIn) ? facts.keptIn : null,
		memberSlugs: Array.isArray(facts.memberSlugs) ? facts.memberSlugs.filter(isFilledText) : []
	};
}

/** The statuses a record moves through: those filed as its statuses, else its lifecycle's, in order. */
export function readStatuses(facts: PlainObject, lifecycle: DomainLifecycleStep[]): string[] {
	const statuses = Array.isArray(facts.statuses) ? facts.statuses.filter(isText) : [];
	return statuses.length > 0 ? statuses : lifecycle.map((step) => step.status);
}

function readLifecycle(given: unknown): DomainLifecycleStep[] {
	if (!Array.isArray(given)) return [];
	return given.filter(isPlainObject).filter(isStatusNamed).map(lifecycleStep);
}

function lifecycleStep(step: PlainObject): DomainLifecycleStep {
	const meaning = isText(step.meaning) ? step.meaning : '';
	const movesTo = Array.isArray(step.movesTo) ? step.movesTo.filter(isFilledText) : [];
	return { status: step.status as string, meaning, movesTo };
}

function isStatusNamed(step: PlainObject): boolean {
	return isFilledText(step.status);
}

function isText(value: unknown): value is string {
	return typeof value === 'string';
}
