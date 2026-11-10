/** The text a field was given, trimmed, or empty when it was left out. */
export function readTrimmed(input: Record<string, unknown>, field: string): string {
	return String(input[field] ?? '').trim();
}

export function isGiven(input: Record<string, unknown>, field: string): boolean {
	const value = input[field];
	return value !== undefined && value !== null && value !== '';
}

/** The agenda item's number as read_board_meeting gives it, or null when it is not a whole number from 1. */
export function validateItemNumber(value: unknown): number | null {
	if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) return null;
	return value;
}
