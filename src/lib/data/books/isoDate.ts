const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const isoDateLength = 10;

/** Why a date column cannot hold the value, or null when it is a real day written as 2026-11-30. */
export function validateIsoDate(fieldName: string, candidate: unknown): string | null {
	const isWritten = typeof candidate === 'string' && isoDatePattern.test(candidate);
	if (!isWritten) return `${fieldName} is a date written as 2026-11-30.`;
	const day = new Date(`${candidate}T00:00:00Z`);
	const isRealDay = !Number.isNaN(day.getTime()) && day.toISOString().slice(0, isoDateLength) === candidate;
	if (!isRealDay) return `${fieldName} is not a day on the calendar; ${candidate} was given.`;
	return null;
}
