/** The continuity copy as the client record holds it: when the client's storage was connected, when they
 * confirmed opening a copy, and who at the client confirmed it. Each is blank until it happens. */
export type ContinuityCopy = {
	storageConnectedOn: string | null;
	copyOpenedOn: string | null;
	copyConfirmedBy: string | null;
};

export const continuityCopyLimits = { longestConfirmedBy: 200 } as const;

export const noContinuityCopy: ContinuityCopy = { storageConnectedOn: null, copyOpenedOn: null, copyConfirmedBy: null };

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const dayRefusal = (field: string) => `The ${field} is a real day written YYYY-MM-DD.`;
const futureRefusal = (field: string) => `The ${field} cannot be after today.`;
const confirmedByRefusal = `Who confirmed the copy is 1 to ${continuityCopyLimits.longestConfirmedBy} characters.`;
const openedBeforeConnectedRefusal = 'A copy cannot be opened before the storage it is written to was connected.';

/** The continuity copy as sent, each field checked against its column, or a sentence naming the one that does not fit. */
export function validateContinuityCopy(fields: Record<string, unknown>, today: string): ContinuityCopy | string {
	const storageConnectedOn = readDay(fields.storageConnectedOn);
	if (storageConnectedOn === undefined) return dayRefusal('day the storage was connected');
	const copyOpenedOn = readDay(fields.copyOpenedOn);
	if (copyOpenedOn === undefined) return dayRefusal('day the copy was opened');
	if (isAfter(storageConnectedOn, today)) return futureRefusal('day the storage was connected');
	if (isAfter(copyOpenedOn, today)) return futureRefusal('day the copy was opened');
	const copyConfirmedBy = String(fields.copyConfirmedBy ?? '').trim();
	if (copyConfirmedBy.length > continuityCopyLimits.longestConfirmedBy) return confirmedByRefusal;
	if (copyOpenedOn === null) return { storageConnectedOn, copyOpenedOn, copyConfirmedBy: null };
	if (copyConfirmedBy === '') return confirmedByRefusal;
	if (storageConnectedOn === null || copyOpenedOn < storageConnectedOn) return openedBeforeConnectedRefusal;
	return { storageConnectedOn, copyOpenedOn, copyConfirmedBy };
}

function isAfter(day: string | null, today: string): boolean {
	return day !== null && day > today;
}

function readDay(value: unknown): string | null | undefined {
	const text = String(value ?? '').trim();
	if (text === '') return null;
	if (!isoDatePattern.test(text)) return undefined;
	const day = new Date(`${text}T00:00:00Z`);
	const isRealDay = !Number.isNaN(day.getTime()) && day.toISOString().startsWith(text);
	return isRealDay ? text : undefined;
}
