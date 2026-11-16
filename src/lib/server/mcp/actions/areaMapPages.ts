/** How many companies one connector answer lists: about 26,000 characters, well inside what a Claude reads in one reply. */
export const pinsPerPage = 200;

export const firstPageNumber = 1;

export const pageNumberRefusal = 'pageNumber is a whole number from 1, or left out for the nearest companies. Nothing was read.';

export type AreaMapPage = { pageNumber: number; pageCount: number; firstIndex: number; lastIndex: number };

/** The page asked for, the first when left out, or null when what was sent is not a whole number from 1. */
export function readPageNumber(value: unknown): number | null {
	if (value === undefined || value === null || value === '') return firstPageNumber;
	const pageNumber = Number(value);
	const isWholeFromOne = Number.isInteger(pageNumber) && pageNumber >= firstPageNumber;
	if (!isWholeFromOne) return null;
	return pageNumber;
}

export function pageOf(pinCount: number, pageNumber: number): AreaMapPage {
	const pageCount = Math.max(firstPageNumber, Math.ceil(pinCount / pinsPerPage));
	const firstIndex = (pageNumber - firstPageNumber) * pinsPerPage;
	const lastIndex = Math.min(firstIndex + pinsPerPage, pinCount);
	return { pageNumber, pageCount, firstIndex, lastIndex };
}

export function isPastLastPage(page: AreaMapPage): boolean {
	return page.pageNumber > page.pageCount;
}

export function describePastLastPage(page: AreaMapPage): string {
	return `The map lists ${page.pageCount} page${page.pageCount === 1 ? '' : 's'} of up to ${pinsPerPage} companies; pageNumber ${page.pageNumber} is past the last.`;
}

/** The line saying which of the companies this answer lists and how to reach the rest; nothing when one page holds them all. */
export function describePagePlace(page: AreaMapPage): string[] {
	if (page.pageCount === firstPageNumber) return [];
	const listed = `Page ${page.pageNumber} of ${page.pageCount}: companies ${page.firstIndex + 1} to ${page.lastIndex}, nearest first.`;
	const narrowing = 'Choose SIC codes or a smaller radius to narrow the map.';
	if (page.pageNumber === page.pageCount) return [`${listed} ${narrowing}`];
	return [`${listed} pageNumber ${page.pageNumber + 1} lists the next ${pinsPerPage}. ${narrowing}`];
}
