import { countOf } from '$lib/data/countOf';
import { formatCount } from '$lib/brand/campaigns/campaignReportWords';
import { formatPoundsAndPence, fromPence } from '$lib/data/books/money';
import type { MediumPerformance } from '$lib/brand/performance/performanceReading';
import type { ReadingsSorted } from '$lib/brand/performance/readingsSorted';

/** One medium's figures as read_performance shows them, or the total when the medium is total. */
export function describeMediumPerformance(medium: MediumPerformance): string {
	const figures = [
		`${formatCount(medium.views)} views`,
		`${formatCount(medium.impressions)} impressions`,
		`${formatCount(medium.reach)} reached`,
		`${formatCount(medium.watchSeconds)} seconds watched`,
		`${formatCount(medium.engagements)} engagements (${formatCount(medium.likes)} likes, ${formatCount(medium.comments)} comments, ` +
			`${formatCount(medium.shares)} shares, ${formatCount(medium.saves)} saves)`,
		`${formatCount(medium.clicks)} clicks`,
		`${formatCount(medium.conversions)} conversions`,
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
