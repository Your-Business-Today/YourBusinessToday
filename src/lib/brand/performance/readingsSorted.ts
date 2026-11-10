import type { PerformanceReading } from './performanceReading';

/** A reading that passed its column checks, and where it sat in the call. */
export type CheckedReading = { position: number; reading: PerformanceReading };

/** The readings of one call split into those to keep and why each of the others was refused. */
export type ReadingsSorted = { kept: PerformanceReading[]; refusals: string[] };

/** Which of the brand's pieces and campaigns exist, and the readings it already holds, for the readings of a call. */
export type BrandRecordsKnown = {
	pieceIds: Set<string>;
	campaignIds: Set<string>;
	readingKeys: Set<string>;
};

/** How a refusal names the reading it is about: its place in the call, counted from one. */
export function readingName(position: number): string {
	return `reading ${position + 1}`;
}
