import { audienceRowKey, type AudienceRow } from './audienceRow';
import { checkAudienceRow } from './checkAudienceRow';
import { isPlainRecord } from '$lib/data/isPlainRecord';

const alreadyHeld = 'that age band and gender already has figures for this campaign on this day, so they were not added again';

/** The bands of one call split into those to keep and why each of the others was refused, named by its place. */
export type AudienceRowsSorted = { kept: AudienceRow[]; refusals: string[] };

/** Every band given checked against its columns, keeping none the campaign already holds for the day, nor one twice. */
export function sortAudienceRows(given: unknown[], keysHeld: Set<string>): AudienceRowsSorted {
	const sorted: AudienceRowsSorted = { kept: [], refusals: [] };
	const keysTaken = new Set(keysHeld);
	given.forEach((item, position) => {
		const refuse = (problem: string) => sorted.refusals.push(`band ${position + 1}: ${problem}`);
		const check = checkAudienceRow(isPlainRecord(item) ? item : {});
		if ('problem' in check) return refuse(check.problem);
		const isHeld = keysTaken.has(audienceRowKey(check.row));
		if (isHeld) return refuse(alreadyHeld);
		sorted.kept.push(check.row);
		keysTaken.add(audienceRowKey(check.row));
	});
	return sorted;
}
