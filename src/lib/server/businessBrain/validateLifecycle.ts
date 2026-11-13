import { isPlainObject, type PlainObject } from '$lib/data/plainObject';
import { domainFilingLimits } from '$lib/data/businessBrainDomainRules';
import { lengthRefusal } from './businessBrainFieldRefusals';
import { trimmedText } from '$lib/data/trimmedText';
import type { DomainLifecycleStep } from '$lib/data/businessBrainDomain';

const { mostStatuses, longestStatus, longestMeaning } = domainFilingLimits;

export const lifecycleRefusal = `The lifecycle is a list of at most ${mostStatuses} statuses, each a status with its meaning and the statuses it moves to.`;

export const movesToRefusal = `movesTo is a list of the statuses of this same lifecycle a record in it can move to, each once, at most ${mostStatuses}.`;

export const statusesOfLifecycleRefusal = 'The statuses are taken from the lifecycle: leave statuses out, or give the lifecycle’s statuses in the same order.';

/** Why a status cannot be the record's own name: a status is a describing word. */
export function ownNameRefusal(status: string): string {
	return `"${status}" is the record’s own name, never one of its statuses; a status is a describing word, such as Signed.`;
}

/** The status, if any, that is the record's own name. */
export function statusNamingRecord(statuses: string[], recordTitle: string): string | undefined {
	const recordName = recordTitle.toLowerCase();
	return statuses.find((status) => status.toLowerCase() === recordName);
}

/** A record's lifecycle as given, every move to a status of its own, or a sentence naming the first that does not fit. */
export function validateLifecycle(given: unknown, recordTitle: string, label: string): DomainLifecycleStep[] | string {
	if (given === undefined) return [];
	if (!Array.isArray(given) || given.length > mostStatuses) return `${label}: ${lifecycleRefusal}`;
	const steps: DomainLifecycleStep[] = [];
	for (const [index, step] of given.entries()) {
		const checked = validateStep(isPlainObject(step) ? step : {}, `${label}, lifecycle ${index + 1}`);
		if (typeof checked === 'string') return checked;
		steps.push(checked);
	}
	return lifecycleRefusalOf(steps, recordTitle, label) ?? steps;
}

function validateStep(step: PlainObject, label: string): DomainLifecycleStep | string {
	const status = trimmedText(step.status);
	const meaning = trimmedText(step.meaning);
	const refusal = lengthRefusal('status', status, longestStatus, true) ?? lengthRefusal('meaning', meaning, longestMeaning, false);
	if (refusal !== null) return `${label}: ${refusal}`;
	const movesTo = validateMovesTo(step.movesTo);
	return movesTo === null ? `${label} (${status}): ${movesToRefusal}` : { status, meaning, movesTo };
}

function validateMovesTo(given: unknown): string[] | null {
	if (given === undefined) return [];
	if (!Array.isArray(given) || given.length > mostStatuses) return null;
	const movesTo = given.map(trimmedText);
	const isEachOnce = new Set(movesTo).size === movesTo.length;
	return isEachOnce && movesTo.every((status) => status !== '') ? movesTo : null;
}

/** Why the lifecycle does not hold together, or null: a status given twice, the record's own name, or a move to no status of its own. */
function lifecycleRefusalOf(steps: DomainLifecycleStep[], recordTitle: string, label: string): string | null {
	const statuses = steps.map((step) => step.status);
	const repeated = statuses.find((status, index) => statuses.indexOf(status) !== index);
	if (repeated !== undefined) return `${label}, lifecycle: the status ${repeated} is given twice; each status is one row.`;
	const ownName = statusNamingRecord(statuses, recordTitle);
	if (ownName !== undefined) return `${label}, lifecycle: ${ownNameRefusal(ownName)}`;
	const strayMove = steps.find((step) => step.movesTo.some((target) => !statuses.includes(target)));
	if (strayMove === undefined) return null;
	const target = strayMove.movesTo.find((status) => !statuses.includes(status));
	return `${label}, lifecycle (${strayMove.status}): it moves to ${target}, which is no status of this lifecycle; its statuses are ${statuses.join(', ')}.`;
}

/** The statuses a record keeps: its lifecycle's when it has one, else those given; null when both are given and differ. */
export function statusesOfRecord(statuses: string[], lifecycle: DomainLifecycleStep[]): string[] | null {
	if (lifecycle.length === 0) return statuses;
	const lifecycleStatuses = lifecycle.map((step) => step.status);
	const isStatusesLeftOut = statuses.length === 0;
	const isSameLength = statuses.length === lifecycleStatuses.length;
	const isSameList = isSameLength && statuses.every((status, index) => status === lifecycleStatuses[index]);
	return isStatusesLeftOut || isSameList ? lifecycleStatuses : null;
}
