import { checkPerformanceReading } from './checkPerformanceReading';
import type { PerformanceReading } from './performanceReading';
import { readingKey } from './readingKey';
import { readingName, type BrandRecordsKnown, type CheckedReading, type ReadingsSorted } from './readingsSorted';

type Input = Record<string, unknown>;

/** Every reading given checked against its columns: the ones that fit, and each refusal named by its place. */
export function checkReadings(given: unknown[]): { checked: CheckedReading[]; refusals: string[] } {
	const checked: CheckedReading[] = [];
	const refusals: string[] = [];
	given.forEach((item, position) => {
		const check = checkPerformanceReading(isInput(item) ? item : {});
		if ('problem' in check) {
			refusals.push(`${readingName(position)}: ${check.problem}`);
			return;
		}
		checked.push({ position, reading: check.reading });
	});
	return { checked, refusals };
}

/** The checked readings that are for the brand's own piece or campaign and not yet recorded for their day. */
export function sortReadings(checked: CheckedReading[], known: BrandRecordsKnown): ReadingsSorted {
	const sorted: ReadingsSorted = { kept: [], refusals: [] };
	const keysTaken = new Set(known.readingKeys);
	for (const { position, reading } of checked) {
		const key = readingKey(reading);
		const problem = problemWithSubject(reading, known) ?? problemWithDay(key, keysTaken);
		if (problem !== null) {
			sorted.refusals.push(`${readingName(position)}: ${problem}`);
			continue;
		}
		sorted.kept.push(reading);
		keysTaken.add(key);
	}
	return sorted;
}

function problemWithSubject(reading: PerformanceReading, known: BrandRecordsKnown): string | null {
	const isUnknownPiece = reading.contentPieceId !== null && !known.pieceIds.has(reading.contentPieceId);
	if (isUnknownPiece) return 'no piece of that id is in this brand’s content; list_content gives the ids';
	const isUnknownCampaign = reading.campaignId !== null && !known.campaignIds.has(reading.campaignId);
	if (isUnknownCampaign) return 'no campaign of that id is in this brand; list_campaigns gives the ids';
	return null;
}

function problemWithDay(key: string, keysTaken: Set<string>): string | null {
	if (!keysTaken.has(key)) return null;
	return 'that piece or campaign already has a reading for this medium on this day, so it was not added again';
}

function isInput(item: unknown): item is Input {
	return typeof item === 'object' && item !== null && !Array.isArray(item);
}
