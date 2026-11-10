import { businessBrainFilingLimits } from '$lib/data/businessBrainRules';
import { trimmedText } from '$lib/data/trimmedText';

const { mostPagesPerCall } = businessBrainFilingLimits;

const sourceFieldNames = ['sourceTitle', 'sourceOrigin', 'sourceSummary', 'sourceId'] as const;

/** One page of a list as it was given, its values not yet checked. */
export type BusinessBrainPageEntry = Record<string, unknown>;

export const pageListRefusal =
	`Give pages as a list of 1 to ${mostPagesPerCall} pages, each with part, kind, title and body. ` +
	'File a longer list over several calls. Nothing was filed.';

/** The pages as given, as many as one call files, or the sentence refusing the whole call. */
export function validateBusinessBrainPageList(pages: unknown): BusinessBrainPageEntry[] | string {
	if (!Array.isArray(pages)) return pageListRefusal;
	const isFittingCount = pages.length >= 1 && pages.length <= mostPagesPerCall;
	if (!isFittingCount) return pageListRefusal;
	return pages.map(entryOf);
}

function entryOf(page: unknown): BusinessBrainPageEntry {
	const isEntry = typeof page === 'object' && page !== null && !Array.isArray(page);
	if (!isEntry) return {};
	return page as BusinessBrainPageEntry;
}

/** Whether the input names a source of any kind: a new one described, or an earlier one by its id. */
export function namesASource(input: Record<string, unknown>): boolean {
	return sourceFieldNames.some((fieldName) => trimmedText(input[fieldName]) !== '');
}

/** The source fields of the input alone, to stand in for a page's own. */
export function sourceFieldsOf(input: Record<string, unknown>): Record<string, unknown> {
	return Object.fromEntries(sourceFieldNames.map((fieldName) => [fieldName, input[fieldName]]));
}

/** The page entry's title, to say which page an answer is about. */
export function entryTitle(page: BusinessBrainPageEntry): string {
	return trimmedText(page.title) || 'a page with no title';
}
