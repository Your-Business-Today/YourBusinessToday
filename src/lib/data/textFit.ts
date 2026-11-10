const ellipsis = '…';

/** A title cut to its longest length, ending in an ellipsis when it had to be cut, so it fits a box on a map. */
export function shortenedToFit(title: string, longest: number): string {
	if (title.length <= longest) return title;
	return `${title.slice(0, longest - 1).trimEnd()}${ellipsis}`;
}
