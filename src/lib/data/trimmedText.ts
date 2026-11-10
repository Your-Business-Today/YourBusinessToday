/** A value sent as input, read as text with the space around it gone; nothing sent reads as blank. */
export function trimmedText(value: unknown): string {
	return String(value ?? '').trim();
}
