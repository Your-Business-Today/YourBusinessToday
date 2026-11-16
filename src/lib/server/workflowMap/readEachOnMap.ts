import { fieldsOf, isRefused, readList } from '$lib/server/filing/filedText';
import { readMapKey } from './readMapWords';
import type { HandoverEnds } from '$lib/data/workflowMap/workflowMapAmendment';
import type { Refusal } from '$lib/server/portal/portalFormReading';

type Reader<Value> = (candidate: unknown, label: string) => Value | Refusal;

/** Reads every value of a list the connector gives, each by the reader for its kind, refusing the first that does not fit. */
export function readEach<Value>(value: unknown, list: { most: number; field: string; label: string }, read: Reader<Value>): Value[] | Refusal {
	const candidates = readList(value, list.most, list.field);
	if (isRefused(candidates)) return candidates;
	const values: Value[] = [];
	for (const [index, candidate] of candidates.entries()) {
		const reading = read(candidate, `${list.label} ${index + 1}`);
		if (isRefused(reading)) return reading;
		values.push(reading);
	}
	return values;
}

/** The two stations a hand-over joins, each a key in the shape of a key. */
export function readHandoverEnds(candidate: unknown, label: string): HandoverEnds | Refusal {
	const fields = fieldsOf(candidate);
	const fromKey = readMapKey(fields.fromKey, `${label} fromKey`);
	if (isRefused(fromKey)) return fromKey;
	const toKey = readMapKey(fields.toKey, `${label} toKey`);
	if (isRefused(toKey)) return toKey;
	return { fromKey, toKey };
}
