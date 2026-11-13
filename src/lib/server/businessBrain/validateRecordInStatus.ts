import { domainFilingLimits } from '$lib/data/businessBrainDomainRules';
import { isPageSlug, lengthRefusal, slugRefusal } from './businessBrainFieldRefusals';
import { trimmedText } from '$lib/data/trimmedText';
import type { PlainObject } from '$lib/data/plainObject';

const { longestStatus } = domainFilingLimits;

/** The names of the two facts that place something on a record in one of its statuses, such as marksThingSlug and marksStatus. */
export type RecordInStatusNames = { thing: string; status: string };

/** A record by its slug and, when given, the status of it named; the status is blank when none is given. */
export type RecordInStatus = { thingSlug: string; status: string };

/** The record and status as given, null when neither is, or a sentence naming what does not fit. */
export function validateRecordInStatus(entry: PlainObject, names: RecordInStatusNames): RecordInStatus | null | string {
	const thingSlug = trimmedText(entry[names.thing]);
	const status = trimmedText(entry[names.status]);
	const isThingNamed = thingSlug !== '';
	if (!isThingNamed && status !== '') return `${names.status} is a status of the record named in ${names.thing}, so it comes with it.`;
	if (!isThingNamed) return null;
	if (!isPageSlug(thingSlug)) return `${names.thing}. ${slugRefusal}`;
	return lengthRefusal(names.status, status, longestStatus, false) ?? { thingSlug, status };
}
