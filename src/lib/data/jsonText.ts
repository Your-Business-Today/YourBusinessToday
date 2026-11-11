/** What the text holds as JSON, or null when it is not JSON at all. */
export function parsedJsonOrNull(text: string): unknown {
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}
