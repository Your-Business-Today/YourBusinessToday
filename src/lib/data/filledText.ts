/** A value read from stored facts that is text with something in it; anything else reads as absent. */
export function isFilledText(value: unknown): value is string {
	return typeof value === 'string' && value !== '';
}

/** The text a fact holds, or null when it holds none. */
export function filledTextOf(given: unknown): string | null {
	return isFilledText(given) ? given : null;
}

/** The texts a list fact holds, leaving out anything that is not text with something in it. */
export function filledTextsOf(given: unknown): string[] {
	return Array.isArray(given) ? given.filter(isFilledText) : [];
}
