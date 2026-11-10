import { countOf } from '$lib/data/countOf';
import { formatPoundsAndPence, fromPence } from '$lib/data/books/money';
import type { MediumPerformance } from '$lib/brand/performance/performanceReading';
import type { ReadingsSorted } from '$lib/brand/performance/readingsSorted';

const wholeNumbers = new Intl.NumberFormat('en-GB');

/** One medium's figures as read_performance shows them, or the total when the medium is total. */
export function describeMediumPerformance(medium: MediumPerformance): string {
	const figures = [
		`${counted(medium.views)} views`,
		`${counted(medium.watchSeconds)} seconds watched`,
		`${counted(medium.engagements)} engagements (${counted(medium.likes)} likes, ${counted(medium.comments)} comments, ` +
			`${counted(medium.shares)} shares, ${counted(medium.saves)} saves)`,
		`${counted(medium.clicks)} clicks`,
		`${counted(medium.conversions)} conversions`,
		`${formatPoundsAndPence(fromPence(medium.spendPence))} spent`
	];
	return `- ${medium.mediumPath}: ${figures.join(', ')}`;
}

/** What record_performance says it kept, and each reading it refused by name. */
export function describeRecording({ kept, refusals }: ReadingsSorted, brandName: string): string {
	const keptLine = describeKept(kept.length, brandName);
	if (refusals.length === 0) return keptLine;
	const refusedLine = `Refused ${countOf(refusals.length, 'reading')}, and nothing was kept for those:`;
	return [keptLine, refusedLine, ...refusals.map((refusal) => `- ${refusal}`)].join('\n');
}

function describeKept(keptCount: number, brandName: string): string {
	if (keptCount === 0) return 'No reading was recorded.';
	return `Recorded ${countOf(keptCount, 'reading')} for ${brandName}’s brand. read_performance adds them up.`;
}

function counted(count: number): string {
	return wholeNumbers.format(count);
}
