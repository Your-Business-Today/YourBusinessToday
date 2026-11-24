const textEncoder = new TextEncoder();

/** How many separators Postgres writes with a space after it when it writes the value back as jsonb text: ", " and ": ". */
function spacedSeparatorCount(value: unknown): number {
	if (Array.isArray(value)) {
		const betweenElements = Math.max(value.length - 1, 0);
		return value.reduce((count: number, element) => count + spacedSeparatorCount(element), betweenElements);
	}
	if (typeof value !== 'object' || value === null) return 0;
	const entries = Object.values(value);
	const betweenEntries = Math.max(entries.length - 1, 0) + entries.length;
	return entries.reduce((count: number, entry) => count + spacedSeparatorCount(entry), betweenEntries);
}

/**
 * The bytes of the drawing as migration 0278 measures it, `octet_length(strokes::text)`: the JSON the site writes,
 * with the one space Postgres puts after every comma and colon. Exact for whole numbers and text, which is all a
 * drawing the rules take holds.
 */
export function whiteboardDrawingBytes(items: unknown): number {
	return textEncoder.encode(JSON.stringify(items)).length + spacedSeparatorCount(items);
}
