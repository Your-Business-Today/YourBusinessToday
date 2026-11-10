const wholeNumberPattern = /^\d+$/;

/** The count as given, or why a whole-number column cannot hold it: never rounded, never made positive. */
export function validateCount(fieldName: string, candidate: unknown, largest: number): number | string {
	const count = readCount(candidate);
	if (count === null) return `${fieldName} is a whole number, such as 120; ${String(candidate)} was given`;
	if (count < 0) return `${fieldName} cannot be below zero; ${count} was given`;
	if (!Number.isInteger(count)) return `${fieldName} is a whole number; ${count} was given`;
	if (count > largest) return `${fieldName} is at most ${largest}; ${count} was given`;
	return count;
}

function readCount(candidate: unknown): number | null {
	if (typeof candidate === 'number') return Number.isFinite(candidate) ? candidate : null;
	if (typeof candidate !== 'string') return null;
	const written = candidate.trim();
	const isWholeNumber = wholeNumberPattern.test(written);
	if (!isWholeNumber) return null;
	return Number(written);
}
