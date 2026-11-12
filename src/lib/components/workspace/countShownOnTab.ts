const emptyTabCount = 0;

/** The count a tab shows: how many items it holds, or none when it holds none or is not counted. */
export function countShownOnTab(count: number | null | undefined): number | null {
	if (count === undefined || count === null || count === emptyTabCount) return null;
	return count;
}
